import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import { createRouter, createWebHashHistory } from "vue-router";
import ViewBracket from "./pages/ViewBracket.vue";
import ListTeams from "./pages/ListTeams.vue";
import TeamDashboard from "./pages/TeamDashboard.vue";
import { createPinia } from "pinia";

import "./assets/main.css";
import "primevue/resources/themes/md-dark-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const routes = [
  { path: "/", component: ViewBracket },
  { path: "/teams", component: ListTeams },
  { path: "/team/:id", component: TeamDashboard },
];
const pinia = createPinia();

const app = createApp(App);
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
app.use(pinia);
app.use(router);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);

app.component("Button", Button);
app.component("Toast", Toast);

app.mount("#app");
