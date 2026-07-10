// IRO - Issues Reporting Outlet
// Simple client-side storage using localStorage (demo purposes only)

const STORAGE_KEY = "iro_issues";

function getIssues() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

// ---- Report form handling ----
const reportForm = document.getElementById("reportForm");
if (reportForm) {
  reportForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const respondentType = document.querySelector('input[name="respondentType"]:checked').value;
    const community = document.getElementById("community").value;
    const issueType = document.getElementById("issueType").value;
    const description = document.getElementById("description").value.trim();

    const issues = getIssues();
    issues.unshift({
      id: Date.now(),
      fullName,
      respondentType,
      community,
      issueType,
      description,
      status: "Open",
      dateReported: Date.now()
    });
    saveIssues(issues);

    reportForm.reset();
    const banner = document.getElementById("successBanner");
    banner.classList.add("show");
    setTimeout(() => { window.location.href = "issues.html"; }, 900);
  });
}

// ---- Issues list rendering ----
function renderIssues() {
  const wrap = document.getElementById("issuesWrap");
  const countPill = document.getElementById("countPill");
  if (!wrap) return;

  const issues = getIssues();
  countPill.textContent = issues.length + (issues.length === 1 ? " issue reported" : " issues reported");

  if (issues.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      No issues reported yet. <a href="report.html">Report the first one</a>.
    </div>`;
    return;
  }

  let rows = issues.map(issue => `
    <tr>
      <td>${formatDate(issue.dateReported)}</td>
      <td>${escapeHtml(issue.fullName)}</td>
      <td>${issue.respondentType}</td>
      <td>${issue.community}</td>
      <td>${issue.issueType}</td>
      <td>${escapeHtml(issue.description)}</td>
      <td><span class="tag ${issue.status === "Resolved" ? "tag-resolved" : "tag-open"}">${issue.status}</span></td>
      <td>
        ${issue.status === "Open"
          ? `<button class="btn" style="padding:6px 12px; font-size:13px;" onclick="markResolved(${issue.id})">Mark resolved</button>`
          : "&mdash;"}
      </td>
    </tr>
  `).join("");

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Name</th><th>Type</th><th>Community</th>
          <th>Issue</th><th>Description</th><th>Status</th><th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function markResolved(id) {
  const issues = getIssues();
  const target = issues.find(i => i.id === id);
  if (target) target.status = "Resolved";
  saveIssues(issues);
  renderIssues();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}