// src/hooks/useGetAllMessage.jsx
import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "@/utils/socket"; // Import direct

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector(store => store.auth);

  useEffect(() => {
    const fetchAllMessage = async () => {
      if (!selectedUser?._id) return;

      try {
        const res = await axios.get(
          `https://youguybackend.vercel.app/api/v1/message/all/${selectedUser._id}`, 
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages)); // Payload sérialisable
          socket.emit("messages-fetched"); // Utilisation directe
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllMessage();
  }, [selectedUser, dispatch]);

  return null;
};

export default useGetAllMessage;