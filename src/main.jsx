import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "../src/components/home.jsx";
import ProfilePage from "../src/components/ProfilePage.jsx";
import ImageUrlUpload from "../src/components/imageUrlUpload.jsx";
import ProfileImageDisplay from "../src/components/profileImageDisplay.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/profilePage",
    element: <ProfilePage />,
  },
  {
    path: "/imageUrlUpload",
    element: <ImageUrlUpload />,
  },
  {
    path: "/profileImageDisplay",
    element: <ProfileImageDisplay />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
