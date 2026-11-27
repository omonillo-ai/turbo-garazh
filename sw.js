// Service Worker — «помощник», который сохраняет игру в телефоне, чтобы она открывалась как приложение
const KESH = "turbo-garazh-v5";
const OSNOVA = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(KESH).then((c) => c.addAll(OSNOVA)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== KESH).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (e.request.method !== "GET") return;
  // библиотека Three.js не меняется — берём из памяти, если уже скачали
  if (url.includes("cdn.jsdelivr.net/npm/three@")) {
    e.respondWith(caches.open(KESH).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((otv) => { c.put(e.request, otv.clone()); return otv; }))));
    return;
  }
  // сама игра: сначала пробуем интернет (чтобы были обновления), без интернета — сохранённая копия
  if (url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request).then((otv) => { const kopiya = otv.clone(); caches.open(KESH).then((c) => c.put(e.request, kopiya)); return otv; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html"))));
  }
});
