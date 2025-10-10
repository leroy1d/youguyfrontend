import { useDispatch, useSelector } from 'react-redux';
import { followUnfollowUser } from '@/redux/authSlice';
import { toast } from 'react-hot-toast';

export const useFollowUnfollow = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(store => store.auth);

  const handleFollowUnfollow = async (userId, isFollowing) => {
    try {
      await dispatch(followUnfollowUser({ userId, isFollowing })).unwrap();
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return { handleFollowUnfollow, isLoading };
};