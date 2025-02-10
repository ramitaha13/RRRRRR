import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        return;
      }

      let userFound = false;
      let userData = null;
      let userId = null;

      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.username === username && user.password === password) {
          userFound = true;
          userData = user;
          userId = childSnapshot.key;
        }
      });

      if (userFound) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: userData.username,
            role: userData.role,
            uid: userId,
          })
        );
        navigate("/ProfilePage");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى");
      console.error("Error during login:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-blue-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">
            تسجيل الدخول
          </h2>
          <p className="text-gray-600">مرحباً بك مجدداً</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-500 justify-end">
              <span>{error}</span>
              <AlertCircle size={20} />
            </div>
          )}

          <div className="space-y-2">
            <label
              className="text-sm font-medium block text-gray-700"
              htmlFor="username"
            >
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              placeholder="ادخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium block text-gray-700"
              htmlFor="password"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              placeholder="ادخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-lg"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
