import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQsVNWYkOtBcbHMvNxKhGQZCE2rWRV_Wo",
  authDomain: "superchat-5ae65.firebaseapp.com",
  projectId: "superchat-5ae65",
  storageBucket: "superchat-5ae65.firebasestorage.app",
  messagingSenderId: "305998015936",
  appId: "1:305998015936:web:5432fb9513c9cf5f5d6c25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);



function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>

      <section>
        {user? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
      signInWithPopup(auth,provider);
  }
  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef();


  const messagesRef = collection(firestore,'messages');
  const msgquery = query(messagesRef,orderBy('createdAt'),limit(100));

  const [messages] = useCollectionData(msgquery, { idField: 'id' });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({behaviour: 'smooth'});
  }

  return (
    <>
     <main>
       {messages &&
       messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
       <div ref={dummy}></div>
     </main>

     <form onSubmit={sendMessage}>

     <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>

     <button type="submit">send</button>
     </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' :'received';
  return (
    
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt=''></img>
      <p>{text}</p>
    </div>
  )
}

export default App;

