export async function refreshAiDashboardRecommendation() {
  const response = await fetch("http://localhost:3000/api/dashboard-ai/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Không thể làm mới lời khuyên AI");
  }

  return result;
}