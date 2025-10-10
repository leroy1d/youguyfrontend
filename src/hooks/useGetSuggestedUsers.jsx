// src/hooks/useGetSuggestedUsers.jsx
import { setSuggestedUsers } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "@/utils/socket"; // Import direct

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get('http://localhost:8001/api/v1/user/suggested', { 
          withCredentials: true 
        });
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users)); // Payload sérialisable
          socket.emit("users-suggested"); // Utilisation directe
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch]);

  return null;
};

export default useGetSuggestedUsers;