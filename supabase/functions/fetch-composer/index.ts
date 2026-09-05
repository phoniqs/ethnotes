import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tunes, error: loadError } = await supabase
      .from("tunes")
      .select("id, abc, user_id");

    if (loadError) throw loadError;

    const sessionUrlRe = /https?:\/\/thesession\.org\/tunes\/(\d+)/i;

    const candidates: { id: string; abc: string; tuneId: number }[] = [];

    for (const row of tunes ?? []) {
      const abc: string = row.abc ?? "";
      const sMatch = abc.match(/^\s*S:\s*(.+)/im);
      if (!sMatch) continue;
      const urlMatch = sMatch[1].trim().match(sessionUrlRe);
      if (!urlMatch) continue;
      const hasC = /^\s*C:/im.test(abc);
      if (hasC) continue;
      candidates.push({ id: row.id, abc, tuneId: parseInt(urlMatch[1], 10) });
    }

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, skipped: 0, errors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const updates: { id: string; abc: string }[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (const candidate of candidates) {
      try {
        const pageUrl = `https://thesession.org/tunes/${candidate.tuneId}`;
        const resp = await fetch(pageUrl, {
          headers: { "User-Agent": "Ethnotes/1.0 (composer lookup)" },
          redirect: "follow",
        });
        if (!resp.ok) {
          errors.push(`Tune ${candidate.tuneId}: HTTP ${resp.status}`);
          skipped++;
          continue;
        }
        const html = await resp.text();

        const composerRe = /<a\s+[^>]*href=["']\/tunes\/composers\/\d+["'][^>]*>([\s\S]*?)<\/a>/gi;
        const composers: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = composerRe.exec(html)) !== null) {
          const text = m[1].replace(/<[^>]*>/g, "").trim();
          if (text && !composers.includes(text)) {
            composers.push(text);
          }
        }

        if (composers.length === 0) {
          skipped++;
          continue;
        }

        const composer = composers.join(", ");

        const lines = candidate.abc.split("\n");
        const cIndex = lines.findIndex((line) => /^\s*C:/i.test(line));
        if (cIndex >= 0) {
          lines[cIndex] = `C:${composer}`;
        } else {
          const keyIndex = lines.findIndex((line) => /^\s*K:/i.test(line));
          if (keyIndex >= 0) {
            lines.splice(keyIndex, 0, `C:${composer}`);
          } else {
            lines.push(`C:${composer}`);
          }
        }
        updates.push({ id: candidate.id, abc: lines.join("\n") });
      } catch (err) {
        errors.push(`Tune ${candidate.tuneId}: ${(err as Error).message}`);
        skipped++;
      }
    }

    let updated = 0;
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("tunes")
        .update({ abc: update.abc })
        .eq("id", update.id);
      if (updateError) {
        errors.push(`Failed to update tune ${update.id}: ${updateError.message}`);
      } else {
        updated++;
      }
    }

    const { data: settingsRows, error: settingsError } = await supabase
      .from("tune_settings")
      .select("id, abc, tune_id");

    if (!settingsError && settingsRows) {
      const tuneAbcMap = new Map<string, string>();
      for (const row of tunes ?? []) {
        tuneAbcMap.set(String(row.id), row.abc ?? "");
      }

      for (const sRow of settingsRows) {
        const abc: string = sRow.abc ?? "";
        const hasC = /^\s*C:/im.test(abc);
        if (hasC) continue;

        const parentAbc = tuneAbcMap.get(String(sRow.tune_id)) ?? "";
        const parentCMatch = parentAbc.match(/^\s*C:\s*(.+)/im);
        if (!parentCMatch) continue;
        const composer = parentCMatch[1].trim();

        const lines = abc.split("\n");
        const keyIndex = lines.findIndex((line) => /^\s*K:/i.test(line));
        if (keyIndex >= 0) {
          lines.splice(keyIndex, 0, `C:${composer}`);
        } else {
          lines.push(`C:${composer}`);
        }

        await supabase
          .from("tune_settings")
          .update({ abc: lines.join("\n") })
          .eq("id", sRow.id);
      }
    }

    return new Response(
      JSON.stringify({ updated, skipped, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
