import { type NextPage } from "next";
import Head from "next/head";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FormEventHandler, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { trpc } from "../utils/trpc";
import { Message } from "@prisma/client";

const Home: NextPage = () => {
  const session = useSession();
  const [chat, setChat] = useState<(Message & {author: {id: string; username: string;}})[]>([]);
  const [message, setMessage] = useState<string>('');

  const messageHistoryQuery = trpc.message.history.useQuery({take: 40, skip: chat.length}, {
    onSuccess: ({messages}) => {
      messages = messages.reverse();
      setChat((prev) => [...messages, ...prev])}, 
    enabled: false});

  // message submission
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    messageMutation.mutate({content: message});
  }

  const messageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessage('');
    }
  });

  // get initial message history and connect to chat socket
  useEffect(() => {
    messageHistoryQuery.refetch();
    return socketInitializer as any
  }, []);

  const socketInitializer = async () => {
    // init new socket server if none
    await fetch('/api/socketio');
  
    // connect to socket server
    const socket = io();
    socket.on("newMessage", (message) => {
      setChat((prevMessages) => [...prevMessages, message]);
    });
  
    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }

  return (
    <>
      <Head>
        <title>Chatty!</title>
        <meta name="description" content="A simple chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen">
        <h1 className="flex flex-row justify-between items-center bg-zinc-900 shadow-lg px-6 py-3 font-bold">
          <span className="text-4xl text-zinc-200">Chatty!</span>
          {session.status === 'authenticated' &&
            <span className="text-4xl font-normal text-zinc-200">{`Welcome ${session.data.user?.name}`}</span>
          }
          {session.status === 'authenticated' ?
            <button 
              className="text-xl font-normal text-zinc900 px-5 py-2 rounded-md bg-slate-200 hover:bg-slate-400"
              onClick={() => signOut()}>
              logout
            </button> :
            <Link 
              className="text-xl font-normal text-zinc900 px-5 py-2 rounded-md bg-slate-200 hover:bg-slate-400"
              href='login'>
              Login
            </Link>
          }
        </h1>
        <div className="flex-1 overflow-auto">
          <ul className="flex flex-col justify-end px-6 gap-1">
            <li className="text-md text-slate-400 hover:cursor-pointer" onClick={() => messageHistoryQuery.refetch()}>Load more messages...</li>
            {chat.map((message) => <li className="text-xl font-normal text-zinc-200">{message.author.username}: {message.content}</li>)}
          </ul>
        </div>
        <form className="w-full p-3" onSubmit={handleSubmit}>
          <input
            className="bg-slate-500 text-xl font-normal text-zinc-200 placeholder:text-slate-400 w-full px-3 py-2 outline-none rounded-md  shadow-lg border border-zinc-900"
            type='text'
            placeholder="message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </form>
      </div>
    </>
  );
};

export default Home;
