// src/hooks/useGetAllPost.jsx
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "@/utils/socket"; // Import direct

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get('https://youguybackend.vercel.app:8001/api/v1/post/all', { 
          withCredentials: true 
        });
        if (res.data.success) {
          dispatch(setPosts(res.data.posts)); // Payload sérialisable
          socket.emit("posts-fetched"); // Utilisation directe
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPost();
  }, [dispatch]);

  return null;
};

export default useGetAllPost;