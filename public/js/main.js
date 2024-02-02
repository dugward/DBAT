////IMPORTS

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

//// FIREBASE STARTUP

const firebaseConfig = {
  apiKey: "AIzaSyAb9eAoHWqWh4isXgM2Z5_7uZ-9XOFsYZY",
  authDomain: "dbat-98661.firebaseapp.com",
  projectId: "dbat-98661",
  storageBucket: "dbat-98661.appspot.com",
  messagingSenderId: "286195501587",
  appId: "1:286195501587:web:329846a34d4017417b0de6",
  measurementId: "G-QWT1XZJ4VE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

//// BUTTONS, MENUS

//// DOMGRABBERS

const menuButton = document.querySelector(".menuIcons");
const loginButton = document.querySelector(".loginButton");
const nonDugward = document.querySelector(".nonDugward");
// const dugwardButton = document.querySelector(".dugwardButton");
// const adminMain = document.querySelector(".adminMain");
// const listSearchResult = document.querySelector(".listSearchResult");
// const listEntry = document.querySelector(".listEntry");
const popup = document.querySelector(".popup");
// const leadersInner = document.querySelector(".leadersInner");
const usersInner = document.querySelector(".users-inner");
const spinnerMain = document.querySelector(".spinner.main");
const spinnerPopup = document.querySelector(".spinner.popupspin");
const spinnerTop = document.querySelector(".spinner.topspin");
const wrapper = document.querySelector(".wrapper");
const input = document.querySelector(".input");
const possibles = document.querySelector(".possibles");
const moreButton = document.querySelectorAll(".possible-button.more")[0];
const possiblesCloseButton = document.querySelectorAll(
  ".possible-button.close"
)[0];
const nowStamp = Date.now();
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//// IMPORTANT  AND VARIABLES

var w = document.documentElement.clientWidth || window.innerWidth;
var details;
const date = new Date();
const currentDate = new Date().toLocaleDateString();
const currentYear = date.getFullYear();
const lastYear = currentYear - 1;
const lastLastYear = currentYear - 2;
var purgatory = {};

//// THE HAMBURGLER

function closeMenu() {
  menuButton.getElementsByClassName("close")[0].style.display = "none";
  menuButton.getElementsByClassName("burger")[0].style.display = "block";

  for (let navItem of document.getElementsByClassName("navItem")) {
    navItem.style.display = "none";
  }
}

menuButton.addEventListener("click", function (e) {
  if (e.target.id == "closemenu") {
    closeMenu();
  } else {
    if (user.uid) {
      menuButton.querySelectorAll(".close")[0].style.display = "block";
      menuButton.getElementsByClassName("burger")[0].style.display = "none";

      for (let navItem of document.getElementsByClassName("navItem")) {
        if (!navItem.classList.contains("dugwardButton")) {
          navItem.style.display = "block";
        }
        if (userDoc.admin == true) {
          document.querySelector(".dugwardButton").style.display = "block";
        }
      }
    }
  }
});

window.onresize = () => {
  if (w > 700 && user.uid) {
    for (let navItem of document.getElementsByClassName("navItem")) {
      navItem.style.display = "block";
    }
  } else {
    closeMenu();
  }
};

//// PUT UP USERS FUNCTION

const putUpUserNames = () => {
  popup.innerHTML = "";
  popup.insertAdjacentHTML(
    "afterbegin",

    `<div class="popup-close"><svg xmlns="http://www.w3.org/2000/svg" class="popupclose names" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg></div><div class='users-inner'>
    
    </div>`
  );
  ////close button

  document.querySelector(".popupclose.names").addEventListener("click", () => {
    popupClose();
  });
  for (let thisuser in allUsers) {
    if (thisuser != userName) {
      document.querySelector(".users-inner").insertAdjacentHTML(
        "beforeend",
        `<div class="user-row">
  <div class="user-name ${thisuser}"><span class="user-highlight">${allUsers[thisuser].name}</span></div>
  <div class="follow-button ${thisuser} AAA${thisuser}">Follow</div>
</div>`
      );
    }
  }
  ////add class .followed to the follow buttons of the users the current user is following
  for (let following of userDoc.following) {
    document
      .querySelector(`.follow-button.AAA${following}`)
      .classList.add("followed");
    document.querySelector(`.follow-button.AAA${following}`).textContent =
      "Unfollow";
  }
  ////add event listeners to the .user-name divs
  for (let userNom of document.getElementsByClassName("user-name")) {
    userNom.addEventListener("click", async (e) => {
      clickedUserName = e.currentTarget.classList[1];

      popup
        .querySelector(".popup-close")
        .insertAdjacentHTML(
          "afterend",
          `<div class='chosen-user-name'>${allUsers[clickedUserName].name}</>`
        );
      document.querySelector(".users-inner").innerHTML = "";
      await booksUp(
        clickedUserName,
        document.querySelector(".users-inner"),
        currentYear
      );
      document
        .querySelector(".popupclose.names")
        .replaceWith(
          document.querySelector(".popupclose.names").cloneNode(true)
        );
      document.querySelector(".popupclose.names").classList.add("userup");
      document
        .querySelector(".popupclose.names.userup")
        .addEventListener("click", () => {
          putUpUserNames();
          document
            .querySelector(".popupclose.names")
            .classList.remove("userup");
        });
    });

    ////the follow button event listeners
    for (let followButton of document.getElementsByClassName("follow-button")) {
      followButton.addEventListener("click", async (e) => {
        const clickedUserName = e.currentTarget.classList[1];

        if (followButton.classList.contains("followed")) {
          ////remove the clickedUserName from the current user's following array
          await updateDoc(doc(db, "users", user.uid), {
            following: arrayRemove(clickedUserName),
          });
          ////remove the clickedUserName to the current user's following array in allUsers
          allUsers[`${userName}`].following.splice(
            allUsers[`${userName}`].following.indexOf(clickedUserName),
            1
          );
          ////remove the clickedUserName to the current user's following array in the userDoc
          userDoc.following.splice(
            userDoc.following.indexOf(clickedUserName),
            1
          );
          //remove .followed class from the follow button
          followButton.classList.remove("followed");
          followButton.textContent = "Follow";
        } else {
          ////add the clickedUserName to the current user's following array
          await updateDoc(doc(db, "users", user.uid), {
            following: arrayUnion(clickedUserName),
          });
          ////add the clickedUserName to the current user's following array in allUsers

          allUsers[`${userName}`].following.push(clickedUserName);

          ////add the clickedUserName to the current user's following array in the userDoc
          userDoc.following.push(clickedUserName);
          //add .followed class to the follow button
          followButton.classList.add("followed");
          followButton.textContent = "Unfollow";
        }
      });
    }
  }
};

//// THE BOOKLIST BUTTON

document
  .querySelector(".listsButton")
  .addEventListener("click", async function (e) {
    ////IF LISTSBUTTON HAS CLASS CLOSED

    if (document.querySelector(".listsButton").classList.contains("closed")) {
      // document.querySelector(".five-warning").style.display = "none";
      await popupClose();
      possibles.innerHTML = "";
      moreButton.style.display = "none";
      possiblesCloseButton.style.display = "none";
      document.querySelector("book-list").innerHTML = "";
      // leadersInner.style.display = "none";
      //if the user has books
      if (userDoc.books) {
        await booksUp(
          userName,
          document.querySelector("book-list"),
          currentYear
        );
      }

      // document.querySelector(".progressbar.main").style.display = "none";
      // document.querySelector(".leadersButton").classList.add("closed");
      ////REMOVE CLASS CLOSED FROM LISTSBUTTON

      document.querySelector(".listsButton").classList.remove("closed");
      if (w <= 700) {
        closeMenu();
      }
    } else {
      popupClose();
      if (w <= 700) {
        closeMenu();
      }
    }
  });

//// THE USERS OPENING & CLOSING

document
  .querySelector(".usersButton")
  .addEventListener("click", async function (e) {
    ////IF USERSBUTTON HAS CLASS CLOSED

    if (document.querySelector(".usersButton").classList.contains("closed")) {
      // document.querySelector(".five-warning").style.display = "none";
      popup.style.display = "block";
      possibles.innerHTML = "";
      moreButton.style.display = "none";
      possiblesCloseButton.style.display = "none";
      document.querySelector("main-grid").style.display = "none";
      usersInner.style.display = "flex";
      // leadersInner.style.display = "none";
      await putUpUserNames();
      // document.querySelector(".progressbar.main").style.display = "none";
      // document.querySelector(".leadersButton").classList.add("closed");
      ////REMOVE CLASS CLOSED FROM LEADERSBUTTON

      document.querySelector(".usersButton").classList.remove("closed");
      document.querySelector(".listsButton").classList.add("closed");
      if (w <= 700) {
        closeMenu();
      }
    } else {
      popupClose();
      if (w <= 700) {
        closeMenu();
      }
    }
  });

function popupClose() {
  popup.style.display = "none";
  popup.innerHTML = "<div class='users-inner'></div>";
  // document.querySelector(".progressbar.main").style.display = "block";
  document.querySelector("main-grid").style.display = "flex";
  // leadersInner.style.display = "none";
  usersInner.style.display = "none";
  document.querySelector(".usersButton").classList.add("closed");
  document.querySelector(".listsButton").classList.add("closed");
}

//// THE LOGIN BUTTON

loginButton.addEventListener("click", function (e) {
  signInWithPopup(auth, provider)
    .then((result) => {
      //// THIS GIVES YOU A GOOGLE ACCESS TOKEN. YOU CAN USE IT TO ACCESS THE GOOGLE API.

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      //// THE SIGNED-IN USER INFO.

      user = result.user;
      //// IDP DATA AVAILABLE USING GETADDITIONALUSERINFO(RESULT)

      //// ...

      loginButton.style.display = "none";
    })
    .catch((error) => {
      //// HANDLE ERRORS HERE.

      const errorCode = error.code;
      const errorMessage = error.message;
      //// THE EMAIL OF THE USER'S ACCOUNT USED.

      const email = error.customData.email;
      //// THE AUTHCREDENTIAL TYPE THAT WAS USED.

      const credential = GoogleAuthProvider.credentialFromError(error);
      //// ...
    });
});

//// THE LOGOUT BUTTON

document.querySelector(".logoutButton").addEventListener("click", () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      console.log("logged out");
      user = {};
      var allUsers = {};
      var allBooks = {};
      userDoc = {};
      document.querySelector("book-list").innerHTML = "";
      loginButton.style.display = "block";
      nonDugward.style.display = "none";
      ////HIDE FOOTER

      document.querySelector("footer").style.display = "none";
      if (w <= 700) {
        closeMenu();
      }
      document.querySelector(".dugwardButton").style.display = "none";
    })
    .catch((error) => {
      //// AN ERROR HAPPENED.
    });
});

//// AUTH CHANGE

var user;
var userName;
var userDoc;
var allUsers = {};
// var allLists = {};
var allBooks = {};
var clickedUserName = "";

onAuthStateChanged(auth, async function (u) {
  ////HIDE WRAPPER

  document.querySelector(".wrapper").style.display = "none";
  if (u) {
    spinnerTop.style.display = "block";
    user = u;
    //// CONSOLE.LOG(USER);

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      userDoc = docSnap.data();
      console.log("User data:", userDoc);
      // console.log(user);
      userName = user.uid;
      //change lastLogin on remote database to Date.now()
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: Date.now(),
      });
    } else {
      //// DOCSNAP.DATA() WILL BE UNDEFINED IN THIS CASE

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        following: [],
        lastLogin: Date.now(),
      });
      userDoc = {
        name: user.displayName,
        following: [],
        books: {},
        lastLogin: Date.now(),
      };
      userName = user.uid;
    }

    console.log("Username:", userName);
    console.log(Date.now());

    //if the current user has no books item in userDoc, add it
    if (!userDoc.books) {
      userDoc.books = {};
    }

    ////REPLACE ALLBOOKS WITH THE COLLECTION "BOOKS" FROM THE DATABASE

    const q2 = query(collection(db, "books"));
    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach((doc) => {
      allBooks[doc.id] = doc.data();
    });
    console.log("All Books:");
    console.log(allBooks);
    ////REPLACE ALLUSERS WITH THE COLLECTION "USERS" FROM THE DATABASE

    const q3 = query(collection(db, "users"));
    const querySnapshot3 = await getDocs(q3);
    querySnapshot3.forEach((doc) => {
      allUsers[doc.id] = doc.data();
    });
    //if the current user has no books item in AllUsers, add it
    if (!allUsers[`${userName}`].books) {
      allUsers[`${userName}`].books = {};
    }
    console.log("All Users:");
    console.log(allUsers);

    if (userDoc.books) {
      if (Object.keys(userDoc.books).length > 0) {
        await booksUp(
          userName,
          document.querySelector("book-list"),
          currentYear
        );
      }
    }

    await updatesUp();

    ////SHOW THE FOOTER

    document.querySelector("footer").style.display = "block";
    spinnerTop.style.display = "none";
    ////SHOW WRAPPER

    wrapper.style.display = "block";
    nonDugward.style.display = "block";
    ////HIDE .BLUR

    document.querySelector(".blur").style.display = "none";

    ////Show the menu items if large
    if (w > 700) {
      for (let navItem of document.getElementsByClassName("navItem")) {
        navItem.style.display = "block";
      }
    }
  } else {
    console.log("no one signed in");
    loginButton.style.display = "block";
    wrapper.style.display = "block";
    nonDugward.style.display = "none";
  }
});

////The Input Box

let timeout = null;

////WAIT FOR PAUSE AND THEN RUN THE API RESULT FUNCTION
input.addEventListener("keyup", function (e) {
  // Clear the timeout if it has already been set.
  // This will prevent the previous task from executing
  // if it has been less than <MILLISECONDS>
  clearTimeout(timeout);

  // Make a new timeout set to go off in 1000ms (1 second)
  timeout = setTimeout(async function () {
    console.log("Input Value:", input.value);
    await apiResult(input.value);
    moreButton.style.display = "block";
    possiblesCloseButton.style.display = "block";
  }, 1000);
});

////put up the updates

async function updatesUp() {
  //if the user's following array is not empty
  if (userDoc.following.length != 0) {
    //for each following
    for (let following of userDoc.following) {
      //if the follower has books in allUsers whose timestamp is greater than the user's lastLogin
      if (allUsers[`${following}`].books) {
        var newbooks = 0;
        for (let book in allUsers[`${following}`].books) {
          if (
            allUsers[`${following}`].books[book].timestamp > userDoc.lastLogin
          ) {
            newbooks++;
          }
        }
        if (newbooks > 0) {
          //put up the update
          document
            .querySelector("header")
            .insertAdjacentHTML(
              "afterend",
              `    <div class="follower-update aa${following}"><span class="follower-dismiss aa${following}">X</span>Since your last login, <span class="follower-name">${
                allUsers[`${following}`].name
              }</span> has read <span class="follower-number">${newbooks}</span> more books.</div>`
            );
          //add event listener to the dismiss button
          document
            .querySelector(`.follower-dismiss.aa${following}`)
            .addEventListener("click", () => {
              document
                .querySelector(`.follower-update.aa${following}`)
                .remove();
            });
        }
      }
    }
  }
}

////PUTTING UP THE STARS

function updateStars(rating, starDivClass) {
  if (rating == 0) {
    const allParents = starDivClass.getElementsByClassName("wholestar");
    for (let parent of allParents) {
      parent.style.backgroundImage = "url(img/emptystar.png)";
    }
  } else {
    const ratingDiv = starDivClass.getElementsByClassName(
      `${rating} starhalf`
    )[0];
    const ratingParent = ratingDiv.parentElement;
    if (rating % 1 == 0.5) {
      ratingParent.style.backgroundImage = "url(img/halfstar.png)";
    } else {
      ratingParent.style.backgroundImage = "url(img/fullstar.png)";
    }
    var otherparents = [];
    for (
      var sibling = ratingParent.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      otherparents.push(sibling);
    }
    for (
      var sibling = ratingParent.nextElementSibling;
      sibling;
      sibling = sibling.nextElementSibling
    ) {
      otherparents.push(sibling);
    }

    for (let parent of otherparents) {
      if (parent.firstElementChild.classList[0] < ratingDiv.classList[0]) {
        parent.style.backgroundImage = "url(img/fullstar.png)";
      } else {
        parent.style.backgroundImage = "url(img/emptystar.png)";
      }
    }
  }
}

////Star hovers

function starHover(rating, starsDiv) {
  const halfStars = starsDiv.querySelectorAll(".starhalf");
  for (let halfStar of halfStars) {
    halfStar.addEventListener("mouseover", (e) => {
      //if the halfStar ends in .5 make parent element background halfstar
      if (halfStar.classList[0] % 1 == 0.5) {
        halfStar.parentElement.style.backgroundImage = "url(img/halfstar.png)";
      } else {
        halfStar.parentElement.style.backgroundImage = "url(img/fullstar.png)";
      }
      //all other parent elements to the left are whole stars
      var otherparentsbefore = [];
      for (
        var sibling = halfStar.parentElement.previousElementSibling;
        sibling;
        sibling = sibling.previousElementSibling
      ) {
        otherparentsbefore.push(sibling);
      }
      for (let parent of otherparentsbefore) {
        parent.style.backgroundImage = "url(img/fullstar.png)";
      }

      //all other parent elements to the right are empty stars
      var otherparentsafter = [];
      for (
        var sibling = halfStar.parentElement.nextElementSibling;
        sibling;
        sibling = sibling.nextElementSibling
      ) {
        otherparentsafter.push(sibling);
      }
      for (let parent of otherparentsafter) {
        parent.style.backgroundImage = "url(img/emptystar.png)";
      }
    });
    //on mouseout run updateStars(rating, starsDiv)
    halfStar.addEventListener("mouseout", (e) => {
      updateStars(rating, starsDiv);
    });
  }
}

////THE API RESULT FUNCTION

//A function to take the input value and return the api result from the google books api
async function apiResult(input) {
  possibles.innerHTML = "";
  input = input.replace("&", "and");
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${input}&key=AIzaSyDz7RLi3HFqoAlJVKOOK6e3kIOMdGTR8Gg`
  );
  details = await response.json();
  console.log(details);

  var numb = 0;

  ////FUNCTION TO PUT UP TITLES

  function putUpTitles(params) {
    possibles.style.display = "block";
    for (let i = numb; i < numb + 5; i++) {
      if (details.items[i].volumeInfo.authors) {
        if (details.items[i].volumeInfo.publisher) {
          possibles.insertAdjacentHTML(
            "beforeend",
            `<div class="possible" id="${
              details.items[i].id
            }"><span class="accentText">${
              details.items[i].volumeInfo.title
            } </span>by ${
              details.items[i].volumeInfo.authors
            }, <span class="accentText">
${details.items[i].volumeInfo.publisher},</span> ${details.items[
              i
            ].volumeInfo.publishedDate.slice(0, 4)}</div>`
          );
        } else {
          possibles.insertAdjacentHTML(
            "beforeend",
            `<div class="possible" id="${
              details.items[i].id
            }"><span class="accentText">${
              details.items[i].volumeInfo.title
            } </span>by ${
              details.items[i].volumeInfo.authors
            }, <span class="accentText"> Unknown Publisher,</span> ${details.items[
              i
            ].volumeInfo.publishedDate.slice(0, 4)}</div>`
          );
        }
      } else {
        if (details.items[i].volumeInfo.publisher) {
          possibles.insertAdjacentHTML(
            "beforeend",
            `<div class="possible" id="${
              details.items[i].id
            }"><span class="accentText">${
              details.items[i].volumeInfo.title
            }</span> by Unknown,<span class="accentText">
${details.items[i].volumeInfo.publisher},</span> ${details.items[
              i
            ].volumeInfo.publishedDate.slice(0, 4)}</div>`
          );
        } else {
          possibles.insertAdjacentHTML(
            "beforeend",
            `<div class="possible" id="${
              details.items[i].id
            }"><span class="accentText">${
              details.items[i].volumeInfo.title
            } </span>by Unknown, <span class="accentText">Unknown Publisher</span>, ${details.items[
              i
            ].volumeInfo.publishedDate.slice(0, 4)}</div>`
          );
        }
      }
    }
    ////ADD EVENT LISTENERS TO POSSIBLES
    for (let possible of document.getElementsByClassName("possible")) {
      possible.addEventListener("click", async (e) => {
        //Put the book info into the purgatory object
        const chosenbook = details.items.find(
          (book) => book.id == e.currentTarget.id
        );
        purgatory = {
          author: chosenbook.volumeInfo.authors,
          booklink: chosenbook.volumeInfo.infoLink,
          id: chosenbook.id,
          publishedDate: chosenbook.volumeInfo.publishedDate,
          title: chosenbook.volumeInfo.title,
          subtitle: chosenbook.volumeInfo.title,
          dateread: currentDate,
          rating: 0,
          pulp: false,
        };

        if (chosenbook.volumeInfo.subtitle != chosenbook.volumeInfo.title) {
          purgatory.subtitle = chosenbook.volumeInfo.subtitle;
        }

        if (chosenbook.volumeInfo.imageLinks) {
          purgatory.image = chosenbook.volumeInfo.imageLinks.thumbnail;
        } else {
          purgatory.image =
            "https://cdn.pixabay.com/photo/2018/01/03/09/09/book-3057901_1280.png";
        }

        if (chosenbook.volumeInfo.publisher) {
          purgatory.publisher = chosenbook.volumeInfo.publisher;
        } else {
          purgatory.publisher = "Publisher Unknown";
        }

        if (chosenbook.volumeInfo.description) {
          purgatory.description = chosenbook.volumeInfo.description;
        } else {
          purgatory.description = "No Description";
        }

        console.log(purgatory);
        ////PUT UP THE POPUP
        popup.style.display = "block";
        possibles.style.display = "none";
        moreButton.style.display = "none";
        possiblesCloseButton.style.display = "none";

        ////PUT UP THE POPUP INNER
        popup.innerHTML = `<div class="popup-inner">
        <div class="popup-close"><svg xmlns="http://www.w3.org/2000/svg" class="popupclose" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg></div>
</div>
                <div class="popup-image"><img src="${purgatory.image}" alt=""></div>
                <div class="popup-title"><a href=${purgatory.booklink} target="_blank">${purgatory.title}</a></div>
        <div class="popup-author">${purgatory.author}</div>
        <div class="popup-publisher">${purgatory.publisher}, </div>
        <div class="popup-published">${purgatory.publishedDate}</div>

        <div class="popup-description">${purgatory.description}</div>
        


        <div class="popup-buttons">
<div class="starwrap">
<div id="star-rating" class="bigstars">
  <div class="wholestar">
  <div class=".5 starhalf"></div>
  <div class="1 starhalf"></div>
</div>
<div class="wholestar">
  <div class="1.5 starhalf"></div>
  <div class="2 starhalf"></div>
</div>
<div class="wholestar">
  <div class="2.5 starhalf"></div>
  <div class="3 starhalf"></div>
</div>
<div class="wholestar">
  <div class="3.5 starhalf"></div>
  <div class="4 starhalf"></div>
</div>
<div class="wholestar">
  <div class="4.5 starhalf"></div>
  <div class="5 starhalf"></div>
</div>
</div>
<div class="popup-pulp">Pulp</div>
</div>
        <div class="popup-add">Add</div>
        <div class="popup-cancel">Cancel</div>
        </div>
        </div>`;

        ////SUBTITLE?
        if (purgatory.subtitle) {
          document
            .querySelector(".popup-title")
            .insertAdjacentHTML(
              "afterend",
              `<div class="popup-subtitle">${purgatory.subtitle}</div>`
            );
        }

        ////ADD EVENT LISTENERS TO THE POPUP BUTTONS
        document
          .querySelector(".popup-add")
          .addEventListener("click", async () => {
            ////ADD THE BOOK TO THE USER'S BOOKS ARRAY
            await updateDoc(doc(db, "users", user.uid), {
              [`books.${purgatory.id}`]: {
                dateread: purgatory.dateread,
                timestamp: nowStamp,
                rating: purgatory.rating,
                pulp: purgatory.pulp,
              },
            });
            ////add book to userDoc.books
            userDoc.books[`${purgatory.id}`] = {
              dateread: purgatory.dateread,
              timestamp: nowStamp,
              rating: purgatory.rating,
              pulp: purgatory.pulp,
            };
            console.log("New UserDoc");
            console.log(userDoc);
            ////add book to allUsers
            allUsers[`${userName}`].books[`${purgatory.id}`] = {
              dateread: purgatory.dateread,
              timestamp: nowStamp,
              rating: purgatory.rating,
              pulp: purgatory.pulp,
            };
            console.log("New AllUsers");
            console.log(allUsers);

            ////ADD BOOK TO ALLBOOKS
            allBooks[`${purgatory.id}`] = {
              author: purgatory.author[0],
              booklink: purgatory.booklink,
              description: purgatory.description,
              imageLink: purgatory.image,
              title: purgatory.title,
            };

            if (purgatory.subtitle) {
              allBooks[`${purgatory.id}`].subtitle = purgatory.subtitle;
            }
            console.log("New AllBooks");
            console.log(allBooks);

            //Add book to the database
            await setDoc(doc(db, "books", purgatory.id), {
              author: purgatory.author[0],
              booklink: purgatory.booklink,
              description: purgatory.description,
              imageLink: purgatory.image,

              title: purgatory.title,
            });

            if (purgatory.subtitle) {
              await updateDoc(doc(db, "books", purgatory.id), {
                subtitle: purgatory.subtitle,
              });
            }

            ////PUT UP THE USER'S BOOKS
            document.querySelector("book-list").innerHTML = "";

            await booksUp(
              userName,
              document.querySelector("book-list"),
              currentYear
            );

            possibles.innerHTML = "";
            moreButton.style.display = "none";
            possiblesCloseButton.style.display = "none";
            popupClose();
            document.querySelector(".input").style.display = "block";
            document.querySelector(".input").value = "";
            console.log("book added in theory");
          });
        document
          .querySelector(".popup-cancel")
          .addEventListener("click", () => {
            popupClose();
            possibles.style.display = "block";
            moreButton.style.display = "block";
            possiblesCloseButton.style.display = "block";
            document.querySelector(".input").style.display = "block";
          });
        document.querySelector(".popup-close").addEventListener("click", () => {
          popupClose();
          possibles.style.display = "block";
          moreButton.style.display = "block";
          possiblesCloseButton.style.display = "block";
          document.querySelector(".input").style.display = "block";
        });
        ////stars

        updateStars(purgatory.rating, document.querySelector("#star-rating"));
        starHover(purgatory.rating, document.querySelector("#star-rating"));

        ////ADD EVENT LISTENER TO THE STAR RATING
        document
          .querySelector("#star-rating")
          .addEventListener("click", (e) => {
            const rating = e.target.classList[0];
            purgatory.rating = rating;
            updateStars(
              purgatory.rating,
              document.querySelector("#star-rating")
            );
            starHover(purgatory.rating, document.querySelector("#star-rating"));
            console.log(purgatory.rating);
          });

        ////ADD EVENT LISTENER TO THE PULP BUTTON
        //pulp button changes the pulp property of the book in purgatory and adds filter to all the .wholestar divs
        document.querySelector(".popup-pulp").addEventListener("click", () => {
          if (purgatory.pulp == false) {
            document.querySelector(".popup-pulp").style.background =
              "var(--accent-color)";
            document.querySelector(".popup-pulp").style.color = "white";
            const wholestars = popup.querySelectorAll(".wholestar");
            for (let wholestar of wholestars) {
              //add class .to-green
              wholestar.classList.add("to-green");
            }
            purgatory.pulp = true;
          }
          //if the book is already pulp, change it back
          else {
            purgatory.pulp = false;
            document.querySelector(".popup-pulp").style.background = "white";
            document.querySelector(".popup-pulp").style.color = "black";
            const wholestars = document.querySelectorAll(".wholestar");
            for (let wholestar of wholestars) {
              //remove class .to-green
              wholestar.classList.remove("to-green");
            }
          }
        });

        ////hide input
        document.querySelector(".input").style.display = "none";
      });
    }
  }

  putUpTitles();

  ////MORE BUTTON CLICK EVENT LISTENER
  moreButton.addEventListener("click", () => {
    numb += 5;
    putUpTitles();
  });

  ////CLOSE BUTTON CLICK EVENT LISTENER
  possiblesCloseButton.addEventListener("click", () => {
    possibles.innerHTML = "";
    moreButton.style.display = "none";
    possiblesCloseButton.style.display = "none";
  });
}

////Books Up!

async function booksUp(targetuser, targetElement, year) {
  wrapper.style.display = "block";

  ////FOR EACH BOOK IN THE USER'S BOOKS OF YEAR CHOSEN

  var books = allUsers[targetuser].books;
  //if the year is not all, filter the books object by year
  if (books.length != 0) {
    if (year != "All") {
      books = Object.fromEntries(
        Object.entries(books).filter((book) => {
          return book[1].dateread.includes(year);
        })
      );
    }
  }

  // console.log(books);
  ////SORT THE books object by date read

  var booksArray = Object.entries(books);
  //sort books array by timestamp, newest first
  booksArray.sort((a, b) => {
    return b[1].timestamp - a[1].timestamp;
  });
  books = Object.fromEntries(booksArray);
  // console.log(books);
  ////YEARS AND COUNT
  targetElement.insertAdjacentHTML(
    "beforeend",
    `<div class="year-count-text"><span class="year-now year${currentYear}">${currentYear} </span>|<span class="year-last year${lastYear}"> ${lastYear} </span>|<span class="year-last-last year${lastLastYear} "> ${lastLastYear} </span>|<span class="all-years yearAll"> All</span> : <span class="book-number"></span> books</div>
        `
  );

  ////HIGHLIGHT YEAR
  document.querySelector(`.year${year}`).classList.add("year-highlight");

  ////BOOK CARDS
  if (booksArray.length != 0) {
    for (let book in books) {
      if (books.hasOwnProperty(book)) {
        const frontDate = allUsers[targetuser].books[book].dateread.slice(
          0,
          -4
        );
        const backDate = allUsers[targetuser].books[book].dateread.slice(-2);
        const date = `${frontDate}${backDate}`;

        targetElement.insertAdjacentHTML(
          "beforeend",
          `<div class="book-card card-${book}">
    <div class="book-title"><a href="${
      ///use the link from allBooks
      allBooks[book].booklink
    }" class="book-link" target="_blank" >${allBooks[book].title}</a></div>


    <div class="book-rating"><div id="star-rating-${book}" class="smallstars">
  <div class="wholestar">
  <div class=".5 starhalf"></div>
  <div class="1 starhalf"></div>
</div>
<div class="wholestar">
  <div class="1.5 starhalf"></div>
  <div class="2 starhalf"></div>
</div>
<div class="wholestar">
  <div class="2.5 starhalf"></div>
  <div class="3 starhalf"></div>
</div>
<div class="wholestar">
  <div class="3.5 starhalf"></div>
  <div class="4 starhalf"></div>
</div>
<div class="wholestar">
  <div class="4.5 starhalf"></div>
  <div class="5 starhalf"></div>
</div>
</div></div>
    <div class="book-date">${date}</div>
  </div>`
        );

        ////Put Up stars
        updateStars(
          allUsers[targetuser].books[book].rating,
          document.querySelector(`#star-rating-${book}`)
        );

        if (allUsers[targetuser].books[book].pulp == true) {
          const wholestars = document
            .querySelector(`#star-rating-${book}`)
            .querySelectorAll(".wholestar");
          for (let wholestar of wholestars) {
            //add class .to-green
            wholestar.classList.add("to-green");
          }
        }
      }
      ////Star rating event listener

      if (targetuser == userName) {
        starHover(
          allUsers[targetuser].books[book].rating,
          document.querySelector(`#star-rating-${book}`)
        );
        document
          .querySelector(`#star-rating-${book}`)
          .addEventListener("click", async (e) => {
            const rating = e.target.classList[0];
            allUsers[targetuser].books[book].rating = rating;
            updateStars(
              allUsers[targetuser].books[book].rating,
              document.querySelector(`#star-rating-${book}`)
            );
            starHover(
              allUsers[targetuser].books[book].rating,
              document.querySelector(`#star-rating-${book}`)
            );
            console.log(allUsers[targetuser].books[book].rating);
            //CHANGE RATING IN DATABASE
            await updateDoc(doc(db, "users", user.uid), {
              [`books.${book}.rating`]: `${rating}`,
            });
          });
      }
      if (targetuser == userName) {
        //add trash can svg to end of book card
        document.querySelector(`.book-card:last-child`).insertAdjacentHTML(
          "beforeend",
          `<span class="material-symbols-outlined card-delete">
cancel
</span>`
        );
        //add event listener to trash can svg
        document
          .querySelector(`.book-card:last-child .card-delete`)
          .addEventListener("click", async () => {
            //create and put up new centered div with class "confirm-delete" that says "Are you sure you want to delete this book?" and has two buttons, "Yes" and "No"
            document.querySelector(`.card-${book}`).insertAdjacentHTML(
              "afterend",
              `<div class="confirm-delete">
Are you sure you want to delete this book?
<div class="confirm-buttons">
<div class="confirm-button confirm-yes">Yes&emsp;|</div>
<div class="confirm-button confirm-no">&emsp;No</div>
</div>
</div>`
            );
            //add event listener to the "Yes" button
            document
              .querySelector(".confirm-yes")
              .addEventListener("click", async () => {
                //delete the book from the user's books array
                await updateDoc(doc(db, "users", user.uid), {
                  [`books.${book}`]: deleteField(),
                });
                //delete the book from the userDoc.books object
                delete userDoc.books[book];
                //delete the book from the allUsers.books object
                delete allUsers[`${userName}`].books[book];

                //delete the book card
                document.querySelector(`.book-card:last-child`).remove();
                //delete the confirm-delete div
                document.querySelector(".confirm-delete").remove();
              });
            //add event listener to the "No" button
            document
              .querySelector(".confirm-no")
              .addEventListener("click", () => {
                //delete the confirm-delete div
                document.querySelector(".confirm-delete").remove();
              });
          });
      }
    }
  }
  //// Put up number of books

  document.querySelector(".book-number").innerHTML = booksArray.length;

  ////Event listeners for the years and all
  document.querySelector(".year-now").addEventListener("click", async (e) => {
    targetElement.innerHTML = "";
    await booksUp(targetuser, targetElement, currentYear);
  });
  document.querySelector(".year-last").addEventListener("click", async (e) => {
    targetElement.innerHTML = "";
    await booksUp(targetuser, targetElement, lastYear);
  });
  document
    .querySelector(".year-last-last")
    .addEventListener("click", async (e) => {
      targetElement.innerHTML = "";
      await booksUp(targetuser, targetElement, lastLastYear);
    });
  document.querySelector(".all-years").addEventListener("click", async (e) => {
    targetElement.innerHTML = "";
    await booksUp(targetuser, targetElement, "All");
  });
}
