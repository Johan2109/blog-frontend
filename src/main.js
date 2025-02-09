import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./css/index.css"; // Para Importar TailwindCSS

const app = createApp(App);
app.use(router);
app.mount("#app");
