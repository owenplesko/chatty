import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEventHandler, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

const Register: NextPage = (props): JSX.Element => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const session = useSession();
    const router = useRouter();
    const registerMutation = trpc.account.register.useMutation();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        registerMutation.mutate({username, password}, {
            onSuccess: () => signIn('credentials', {username, password, redirect: false})
        })
    }  

    useEffect(() => {
        if(session.status === 'authenticated')
            router.push({pathname: '/'});
    }, [session])

    return (
        <div className='flex justify-center'>
            <form className='flex flex-col items-center gap-4' onSubmit={handleSubmit}>
                <label>username:</label>
                <input className='border-2 border-slate-900'
                    type='text'
                    value={username}
                    onChange={(e) => {setUsername(e.target.value)}}
                />
                <label>password:</label>
                <input className='border-2 border-slate-900'
                    type='password'
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                />
                <input className='bg-purple-600 px-4 py-2 rounded-md border-2 border-black' type='submit' value='register' />
            </form>
        </div>
    );
}

export default Register;