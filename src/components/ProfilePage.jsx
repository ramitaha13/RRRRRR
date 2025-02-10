import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Send,
  Trash2,
  Clock,
  LogOut,
} from "lucide-react";
import { database } from "../firebase";
import {
  ref,
  push,
  set,
  onValue,
  query,
  orderByChild,
  remove,
} from "firebase/database";
import profileImage from "../assets/1.JPG";
import coverImage from "../assets/2.JPG";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [postText, setPostText] = useState("");
  const [notes, setNotes] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [comments, setComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showCommentOptions, setShowCommentOptions] = useState(null);

  const profile = {
    name: "Rami Sara",
    coverPhoto: coverImage,
    profilePhoto: profileImage,
  };

  useEffect(() => {
    const notesRef = ref(database, "notes");
    const notesQuery = query(notesRef, orderByChild("timestamp"));
    const commentsRef = ref(database, "comments");

    const unsubscribeNotes = onValue(notesQuery, (snapshot) => {
      const notesData = [];
      snapshot.forEach((childSnapshot) => {
        notesData.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setNotes(notesData);
    });

    const unsubscribeComments = onValue(commentsRef, (snapshot) => {
      const commentsData = {};
      snapshot.forEach((childSnapshot) => {
        const comment = childSnapshot.val();
        if (!commentsData[comment.postId]) {
          commentsData[comment.postId] = [];
        }
        commentsData[comment.postId].push({
          id: childSnapshot.key,
          ...comment,
        });
      });
      setComments(commentsData);
    });

    return () => {
      unsubscribeNotes();
      unsubscribeComments();
    };
  }, []);

  const handleLogout = () => {
    navigate("/home");
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    try {
      const notesRef = ref(database, "notes");
      const newNoteRef = push(notesRef);

      await set(newNoteRef, {
        content: postText,
        timestamp: new Date().toISOString(),
        userId: profile.name,
        likes: 0,
        comments: 0,
      });

      setPostText("");
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    try {
      const commentsRef = ref(database, "comments");
      const newCommentRef = push(commentsRef);

      await set(newCommentRef, {
        postId,
        content: commentText,
        timestamp: new Date().toISOString(),
        userId: profile.name,
      });

      const postRef = ref(database, `notes/${postId}`);
      const currentComments = comments[postId]?.length || 0;
      await set(postRef, {
        ...notes.find((note) => note.id === postId),
        comments: currentComments + 1,
      });

      setCommentTexts((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Error saving comment:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const postRef = ref(database, `notes/${postId}`);
      await remove(postRef);

      const commentsToDelete = comments[postId] || [];
      commentsToDelete.forEach(async (comment) => {
        const commentRef = ref(database, `comments/${comment.id}`);
        await remove(commentRef);
      });

      setShowOptions(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const commentRef = ref(database, `comments/${commentId}`);
      await remove(commentRef);

      const postRef = ref(database, `notes/${postId}`);
      const currentComments = comments[postId]?.length || 0;
      await set(postRef, {
        ...notes.find((note) => note.id === postId),
        comments: currentComments - 1,
      });

      setShowCommentOptions(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `قبل ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `قبل ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `قبل ${days} يوم`;
    }
  };

  const getExactTime = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const renderPost = (post) => (
    <div key={post.id} className="bg-white rounded-lg p-4 shadow relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <img
            src={profile.profilePhoto}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{profile.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{getExactTime(post.timestamp)}</span>
            </div>
            <span className="text-gray-500 text-sm">
              {formatTimestamp(post.timestamp)}
            </span>
          </div>
        </div>
        <button
          className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
          onClick={() =>
            setShowOptions(showOptions === post.id ? null : post.id)
          }
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {showOptions === post.id && (
        <div className="absolute left-0 top-12 bg-white shadow-lg rounded-md py-1 z-10">
          <button
            onClick={() => handleDeletePost(post.id)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
          >
            <Trash2 size={16} />
            <span>حذف المنشور</span>
          </button>
        </div>
      )}

      <p className="mb-4">{post.content}</p>
      {post.image && (
        <img src={post.image} alt="Post" className="w-full rounded-lg mb-4" />
      )}

      <div className="flex items-center justify-between text-gray-500 py-2 border-t border-b mb-4">
        <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-md">
          <ThumbsUp size={20} />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-md">
          <MessageCircle size={20} />
          <span>{post.comments}</span>
        </button>
      </div>

      <div className="flex gap-2">
        <img
          src={profile.profilePhoto}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="اكتب تعليقاً..."
            value={commentTexts[post.id] || ""}
            onChange={(e) =>
              setCommentTexts((prev) => ({
                ...prev,
                [post.id]: e.target.value,
              }))
            }
            className="w-full bg-gray-100 rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleCommentSubmit(post.id)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 hover:bg-gray-200 p-2 rounded-full"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comments[post.id]?.map((comment) => (
          <div key={comment.id} className="flex gap-2 relative">
            <img
              src={profile.profilePhoto}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="bg-gray-100 rounded-lg p-3 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{comment.userId}</div>
                  <div className="text-sm text-gray-600">
                    {formatTimestamp(comment.timestamp)}
                  </div>
                  <div className="mt-1">{comment.content}</div>
                </div>
                {comment.userId === profile.name && (
                  <button
                    onClick={() => {
                      setShowCommentOptions(
                        showCommentOptions === comment.id ? null : comment.id
                      );
                    }}
                    className="text-gray-500 hover:bg-gray-200 p-1 rounded-full"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>

              {showCommentOptions === comment.id && (
                <div className="absolute top-0 right-0 bg-white shadow-lg rounded-md py-1 z-10">
                  <button
                    onClick={() => handleDeleteComment(post.id, comment.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                  >
                    <Trash2 size={16} />
                    <span>حذف التعليق</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen" dir="rtl">
      <div className="relative">
        <img
          src={profile.coverPhoto}
          alt="Cover"
          className="w-full h-[350px] object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm hover:bg-red-600"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
          <button className="bg-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm">
            <Camera size={20} />
            <span>تغيير صورة الغلاف</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-8 mb-4">
          <div className="relative">
            <img
              src={profile.profilePhoto}
              alt="Profile"
              className="w-42 h-42 rounded-full border-4 border-white"
            />
            <button className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full">
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <form onSubmit={handlePostSubmit}>
              <div className="flex gap-3 mb-3">
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <input
                  type="text"
                  placeholder="ماذا يدور في ذهنك؟"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="flex-grow bg-gray-100 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end pt-3 border-t">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                >
                  نشر
                </button>
              </div>
            </form>
          </div>

          {notes.map(renderPost)}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
