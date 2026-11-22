const KEY = "couriers";
const STATUSES = ["Booked", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];

const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const save = (data) => localStorage.setItem(KEY, JSON.stringify(data));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const now = () => new Date().toLocaleString("en-IN");

function genId() {
  return "CMS" + Date.now().toString().slice(-8);
}

function calcCost(weight, type) {
  const rates = { Standard: [40, 20], Express: [80, 30], Overnight: [150, 40] };
  const [base, perKg] = rates[type];
  return Math.round(base + weight * perKg);
}

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "dashboard") render();
  });
});

// ---------- Dashboard ----------
function render() {
  const data = load();
  const q = document.getElementById("search").value.trim().toLowerCase();
  const rows = data.filter((c) =>
    [c.id, c.sender, c.receiver, c.from, c.to].some((v) => v.toLowerCase().includes(q))
  );

  document.getElementById("statTotal").textContent = data.length;
  document.getElementById("statDelivered").textContent = data.filter((c) => c.status === "Delivered").length;
  document.getElementById("statTransit").textContent = data.filter((c) => c.status !== "Delivered").length;
  document.getElementById("statRevenue").textContent = "₹" + data.reduce((s, c) => s + c.cost, 0);

  document.getElementById("emptyMsg").style.display = rows.length ? "none" : "block";
  document.getElementById("courierBody").innerHTML = rows
    .map(
      (c) => `
    <tr>
      <td>${esc(c.id)}</td>
      <td>${esc(c.sender)}</td>
      <td>${esc(c.receiver)}</td>
      <td>${esc(c.from)} → ${esc(c.to)}</td>
      <td>${esc(c.type)}</td>
      <td>₹${c.cost}</td>
      <td>
        <select data-id="${esc(c.id)}" class="statusSel">
          ${STATUSES.map((s) => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td><button class="delete" data-id="${esc(c.id)}">Delete</button></td>
    </tr>`
    )
    .join("");
}

document.getElementById("search").addEventListener("input", render);

document.getElementById("courierBody").addEventListener("change", (e) => {
  if (!e.target.classList.contains("statusSel")) return;
  const data = load();
  const c = data.find((x) => x.id === e.target.dataset.id);
  if (c) {
    c.status = e.target.value;
    c.history.push({ status: c.status, time: now() });
    save(data);
    render();
  }
});

document.getElementById("courierBody").addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete")) return;
  if (!confirm("Delete this courier?")) return;
  save(load().filter((x) => x.id !== e.target.dataset.id));
  render();
});

// ---------- Book ----------
const bookForm = document.getElementById("bookForm");

function updateEstimate() {
  const w = parseFloat(bookForm.weight.value) || 0;
  document.getElementById("estimate").textContent = "₹" + (w ? calcCost(w, bookForm.type.value) : 0);
}
bookForm.weight.addEventListener("input", updateEstimate);
bookForm.type.addEventListener("change", updateEstimate);

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(bookForm);
  const weight = parseFloat(f.get("weight"));
  const courier = {
    id: genId(),
    sender: f.get("sender").trim(),
    senderPhone: f.get("senderPhone"),
    receiver: f.get("receiver").trim(),
    receiverPhone: f.get("receiverPhone"),
    from: f.get("from").trim(),
    to: f.get("to").trim(),
    weight,
    type: f.get("type"),
    cost: calcCost(weight, f.get("type")),
    status: "Booked",
    history: [{ status: "Booked", time: now() }],
  };
  const data = load();
  data.unshift(courier);
  save(data);
  bookForm.reset();
  updateEstimate();
  document.getElementById("bookMsg").textContent = `Courier booked! Tracking ID: ${courier.id}`;
});

// ---------- Track ----------
document.getElementById("trackForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("trackId").value.trim().toUpperCase();
  const c = load().find((x) => x.id === id);
  const box = document.getElementById("trackResult");
  if (!c) {
    box.innerHTML = '<p class="error">No courier found with that ID.</p>';
    return;
  }
  box.innerHTML = `
    <div class="timeline">
      <h3>${esc(c.id)} — ${esc(c.status)}</h3>
      <p>${esc(c.from)} → ${esc(c.to)} | ${esc(c.type)} | ${c.weight} kg</p>
      <ul>
        ${c.history.map((h) => `<li><strong>${esc(h.status)}</strong><small>${esc(h.time)}</small></li>`).join("")}
      </ul>
    </div>`;
});

render();
