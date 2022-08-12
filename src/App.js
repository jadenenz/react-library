import React, { useEffect } from 'react'
import './styles.css'

import { 
  getAuth,
  GoogleAuthProvider,
  signOut,
  signInWithPopup
 } from "firebase/auth"
import { 
  query,
  addDoc,
  where,
  getFirestore,
  collection,
  getDocs, } from "firebase/firestore"
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSOSpnhBIMT6G4OQs1_WKATFLYWmtXPO8",
  authDomain: "library-6cb71.firebaseapp.com",
  projectId: "library-6cb71",
  storageBucket: "library-6cb71.appspot.com",
  messagingSenderId: "247712263254",
  appId: "1:247712263254:web:e96f1c0495ecc2199b1ff7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp)



function App() {
  const [user] = useAuthState(auth);

  const [booksArray, setBooksArray] = React.useState()

  // const booksPromise = loadBooks()



  useEffect(() => {
    async function loadBooks() {
      // Create the query to load the last 12 messages and listen for new ones.
      const recentBooksQuery = query(collection(getFirestore(), 'books'), where("userID", "==", user == null ? '' : user.displayName))
      const querySnapshot = await getDocs(recentBooksQuery)
      console.log('querySnapshot',querySnapshot.docs)
      setBooksArray(querySnapshot.docs)
    }

    loadBooks()
  },[user])




  // async function loadBooks() {
  //   // Create the query to load the last 12 messages and listen for new ones.
  //   const recentBooksQuery = query(collection(getFirestore(), 'books'));
  //   const querySnapshot = await getDocs(recentBooksQuery)
  //   // console.log('querySnapshot',querySnapshot._snapshot.docChanges)
  //   return querySnapshot._snapshot.docChanges

    
    // // Start listening to the query.
    // onSnapshot(recentMessagesQuery, function(snapshot) {
    //   snapshot.docChanges()
    // });
  // }


  return (
    <div className="App">
      <header>
      <SignOut />
      </header>

      <section>
      {user ? <Form /> : <SignIn />}
      {booksArray && <Cards booksArray={booksArray} />}
      </section>
    </div>
  );
}

function SignIn() {
  async function signInWithGoogle()  {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), (provider))
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return getAuth().currentUser && (
    <button onClick={() => signOut(getAuth())}>Sign Out</button>
  )
}

function Cards({ booksArray }) {

//  console.log('from cards',booksArray[0].doc.data.value.mapValue.fields.title.stringValue)
  
 const [cardsList, setCardsList] = React.useState(booksArray)

 React.useEffect(() => {
  setCardsList(booksArray)
 },[booksArray])

  const cardsContent = cardsList.map((book) => {
    const title = book.data().title
    const author = book.data().author
    const hasRead = book.data().read
    const pages = book.data().pages
    // console.log('title', typeof title, title);
    return (
      <div key={book.data().title} className='cards--card'>
        <div>{title}</div>
        <div>by {author}</div>
        <div>Page count: {pages}</div>
        <div>Already read?: {hasRead === true ? 'Yes' : 'No'}</div>
      </div>
    )
  }) //this shit right here

  React.useEffect(() => {
    // console.log('cards content is',cardsContent)
  },[cardsContent])

  return (
    <div>
      {(booksArray.length > 0) && cardsContent}
    </div>
  )
}

function Form() {

  const [formData, setFormData] = React.useState(
    {
      title: '',
      author: '',
      pages: '',
      hasRead: false
    }
  )

  function handleChange(event) {
    const {name, value, type, checked} = event.target
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value
      }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    saveBookData(formData)
    console.log(formData)
  }

  //saves a new book to Cloud Firestore
  async function saveBookData(formData) {
    try {
      await addDoc(collection(getFirestore(), 'books'), {
        title: formData.title,
        author: formData.author,
        pages: formData.pages,
        read: formData.hasRead,
        userID: getAuth().currentUser.displayName
      });
    }
    catch(error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }

  return (
    <form>
      <h2>Add Book Information</h2>
        <label htmlFor="title">
            <strong>Title</strong>
        </label>
        <input type='text' id='title' placeholder=
        'Book title' name='title' value={formData.title} onChange={handleChange} required />
        <label htmlFor="author">
            <strong>Author</strong>
        </label>
        <input type='text' id='author' placeholder=
        'Author' name='author' value={formData.author} onChange={handleChange} required />
        <label htmlFor="pages">
            <strong>Pages</strong>
        </label>
        <input type='text' id='pages' placeholder=
        'Pages' name='pages' value={formData.pages} onChange={handleChange} required />
        <label htmlFor="hasRead">
            <strong>Already read?</strong>
        </label>
        <input type='checkbox' id='hasRead' name='hasRead' checked={formData.hasRead} onChange={handleChange} />
        <button type='submit' id='submit' onClick={handleSubmit}>Submit</button>
        <button type='button' id='closeform' >Close</button>
    </form>
  )
}

export default App;
