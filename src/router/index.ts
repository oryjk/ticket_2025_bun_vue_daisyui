import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CurrentOrdersView from "../views/orders/CurrentOrdersView.vue";
import OrderHistoryView from "../views/orders/OrderHistoryView.vue";
import MyView from "../views/MyView.vue";
import { useAuthStore } from "@/stores/auth"; // Import the auth store

const router = createRouter({
  history: createWebHistory("/daisy/"),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/orders/current",
      name: "current-orders",
      component: CurrentOrdersView,
    },
    {
      path: "/orders/history",
      name: "order-history",
      component: OrderHistoryView,
    },
    {
      path: "/my",
      name: "my",
      component: MyView,
    },
  ],
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Get the store instance inside the guard

  // Define public paths that do not require authentication
  const publicPaths = ["/"]; // Only the home/login page is public

  const authRequired = !publicPaths.includes(to.path);
  const loggedIn = authStore.isLoggedIn;

  // If authentication is required and the user is not logged in
  if (authRequired && !loggedIn) {
    // Redirect to the login page
    next("/");
  } else {
    // Allow navigation
    next();
  }
});

export default router;
