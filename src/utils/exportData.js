export function exportAsJSON(data, filename = "fitforce-export") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
}

export function exportAsCSV(rows, headers, filename = "fitforce-export") {
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? "";
        const str = String(val);
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportAsPDF(title, content, filename = "fitforce-export") {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #1a1a1a; }
  h1 { font-size: 22px; margin-bottom: 8px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #ddd; }
  th { font-weight: 600; background: #f5f5f5; }
  .section { margin-bottom: 24px; }
  h2 { font-size: 16px; margin-bottom: 8px; color: #e53935; }
</style></head><body>
<h1>${title}</h1>
<div class="meta">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
${content}
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  downloadBlob(blob, `${filename}.html`);
}

export function exportNutritionCSV(meals) {
  const headers = ["Date", "Name", "Calories", "Protein", "Carbs", "Fat", "Qty", "Meal Time"];
  const rows = meals.map((m) => ({
    Date: m.date || new Date().toLocaleDateString(),
    Name: m.name,
    Calories: m.cal,
    Protein: m.protein,
    Carbs: m.carbs,
    Fat: m.fat,
    Qty: m.qty || 1,
    "Meal Time": m.mealTime || "Snack",
  }));
  exportAsCSV(rows, headers, "fitforce-nutrition");
}

export function exportWorkoutCSV(log) {
  const headers = ["Date", "Exercise", "Sets", "Reps", "Weight", "Volume"];
  const rows = log.map((w) => ({
    Date: w.date,
    Exercise: w.name,
    Sets: w.sets,
    Reps: w.reps,
    Weight: w.weight ? `${w.weight}kg` : "BW",
    Volume: w.vol || "—",
  }));
  exportAsCSV(rows, headers, "fitforce-workouts");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
