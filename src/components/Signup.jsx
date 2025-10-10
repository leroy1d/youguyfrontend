import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '@/contexts/ThemeContext';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('https://youguybackend.vercel.app/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])

    return (
        <div className='flex items-center w-screen h-screen justify-center bg-white dark:bg-black'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700'>
                <div className='my-4'>
                    <h1 className='text-center font-bold text-xl text-black dark:text-white'>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                width: '150px',
                                height: 'auto',
                                margin: '8px auto',
                                maxWidth: '100%' // Pour le responsive
                            }}
                        /></h1>
                    <p className='text-sm text-center text-gray-600 dark:text-gray-400'>Signup to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium text-black dark:text-white'>Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                <div>
                    <span className='font-medium text-black dark:text-white'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                <div>
                    <span className='font-medium text-black dark:text-white'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Signup</Button>
                    )
                }
                <span className='text-center text-black dark:text-white'>Already have an account? <Link to="/login" className='text-blue-600 dark:text-blue-400'>Login</Link></span>
            </form>
        </div>
    )
}

export default Signup