import { defineStore } from "pinia";
import router from '@/router'; // Import the router instance

// Define the interface for MemberInfo
interface MemberInfo {
  id: number;
  member_key: string;
  member_status: string;
  member_name: string;
  description: string;
  phone: string;
  email: string;
  mac_address: string;
  create_at: Date;
  update_at: Date;
  email_count: number;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
    memberInfo: JSON.parse(
      localStorage.getItem("memberInfo") || "null",
    ) as MemberInfo | null, // Load memberInfo from localStorage
  }),
  actions: {
    async login(license: string) {
      if (!license || license.trim() === "") {
        this.isLoggedIn = false;
        this.memberInfo = null;
        localStorage.removeItem("isLoggedIn");
        throw new Error("请输入有效的 License。");
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/member/info/${license.trim()}?licence_key=${encodeURIComponent(license.trim())}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          // Check if response status is not in 200-299 range
          const errorData = await response.json().catch(() => null); // Attempt to parse error body
          this.isLoggedIn = false;
          this.memberInfo = null;
          localStorage.removeItem("isLoggedIn");
          // Use error message from backend if available, otherwise a generic one
          throw new Error(
            errorData?.message ||
              `License 校验失败 (状态码: ${response.status})`,
          );
        }

        const data: MemberInfo = await response.json();

        // Assuming a successful GET request means login is valid
        this.isLoggedIn = true;
        this.memberInfo = data;
        localStorage.setItem("memberInfo", JSON.stringify(data)); // Store member info and persist to localStorage
        localStorage.setItem("isLoggedIn", "true");
        // Optionally store other non-sensitive info or a token if needed
      } catch (error: any) {
        this.isLoggedIn = false;
        this.memberInfo = null;
        localStorage.removeItem("isLoggedIn");
        // Rethrow the caught error
        throw new Error(error.message || "登录请求失败。");
      }
    },
    logout() {
      this.isLoggedIn = false;
      this.memberInfo = null;
      localStorage.removeItem("memberInfo"); // Clear member info and remove from localStorage
      localStorage.removeItem("isLoggedIn");
      // Add any other cleanup here (e.g., clearing user data)

      // Redirect to login page after logout
      router.push('/login');
    },
    persistenceMemberInfo() {
      if (this.memberInfo) {
        console.log("还是持久化persistenceMemberInfo");
        localStorage.setItem("memberInfo", JSON.stringify(this.memberInfo)); // Store member info and persist to localStorage
      }
    },
  },
});
