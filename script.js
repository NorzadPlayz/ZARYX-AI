// ============================================================
// ZARYX AI — MAIN SCRIPT
// Firebase Auth + Netlify Proxy + Chat + Image Generation
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCeKwblfWlRYeLgQYyQiQ3vm0s4bOV13Og",
    authDomain: "zaryx-ai.firebaseapp.com",
    projectId: "zaryx-ai",
    storageBucket: "zaryx-ai.firebasestorage.app",
    messagingSenderId: "406205066198",
    appId: "1:406205066198:web:4bd27a9e5422ffde865277",
    measurementId: "G-CE28Q9FG1L"
};


// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


// ============================================================
// NETLIFY BACKEND
// ============================================================
//
// IMPORTANT:
// The browser talks to Netlify.
// Netlify talks to Google Apps Script.
// This avoids the Google Apps Script CORS problem.
//

const ZARYX_API_URL = "/.netlify/functions/zaryx";

console.log("ZARYX → NETLIFY PROXY:", ZARYX_API_URL);


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;
let conversationHistory = [];


// ============================================================
// DOM ELEMENTS
// ============================================================

const googleLoginButton =
    document.getElementById("googleLoginButton");

const guestLoginButton =
    document.getElementById("guestLoginButton");

const showEmailLoginButton =
    document.getElementById("showEmailLoginButton");

const emailLoginPanel =
    document.getElementById("emailLoginPanel");

const loginPanel =
    document.getElementById("loginPanel");

const signupPanel =
    document.getElementById("signupPanel");

const showSignupButton =
    document.getElementById("showSignupButton");

const backToLoginButton =
    document.getElementById("backToLoginButton");

const backToLoginFromSignupButton =
    document.getElementById("backToLoginFromSignupButton");

const emailLoginButton =
    document.getElementById("emailLoginButton");

const emailSignupButton =
    document.getElementById("emailSignupButton");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const authStatus =
    document.getElementById("authStatus");

const logoutButton =
    document.getElementById("logoutButton");

const chatInput =
    document.getElementById("chatInput");

const sendButton =
    document.getElementById("sendButton");

const chatMessages =
    document.getElementById("chatMessages");

const typingIndicator =
    document.getElementById("typingIndicator");

const chatModeButton =
    document.getElementById("chatModeButton");

const imageModeButton =
    document.getElementById("imageModeButton");

const chatMode =
    document.getElementById("chatMode");

const imageMode =
    document.getElementById("imageMode");

const imagePrompt =
    document.getElementById("imagePrompt");

const generateImageButton =
    document.getElementById("generateImageButton");

const imageLoading =
    document.getElementById("imageLoading");

const imageResult =
    document.getElementById("imageResult");


// ============================================================
// HELPER — ELEMENT CHECK
// ============================================================

function exists(element) {
    return element !== null && element !== undefined;
}


// ============================================================
// AUTH STATUS
// ============================================================

function setAuthStatus(message, type = "") {

    if (!exists(authStatus)) return;

    authStatus.textContent = message;
    authStatus.className = "auth-status";

    if (type) {
        authStatus.classList.add(type);
    }
}


// ============================================================
// FIREBASE ERROR TRANSLATOR
// ============================================================

function getFirebaseError(error) {

    const code = error?.code || "";

    const errors = {

        "auth/popup-closed-by-user":
            "Google login was cancelled.",

        "auth/popup-blocked":
            "Your browser blocked the Google login popup.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/missing-password":
            "Please enter your password.",

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/user-not-found":
            "No account was found with this email.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/email-already-in-use":
            "An account already exists with this email.",

        "auth/weak-password":
            "Password is too weak.",

        "auth/admin-restricted-operation":
            "This login method is disabled in Firebase.",

        "auth/operation-not-allowed":
            "This login method is not enabled in Firebase.",

        "auth/network-request-failed":
            "Network connection failed."
    };

    return errors[code] ||
        error?.message ||
        "Authentication failed.";
}


// ============================================================
// HIDE / SHOW AUTH PANELS
// ============================================================

function showLoginPanel() {

    if (exists(loginPanel))
        loginPanel.classList.remove("hidden");

    if (exists(emailLoginPanel))
        emailLoginPanel.classList.add("hidden");

    if (exists(signupPanel))
        signupPanel.classList.add("hidden");

    setAuthStatus("");
}


function showEmailPanel() {

    if (exists(loginPanel))
        loginPanel.classList.add("hidden");

    if (exists(emailLoginPanel))
        emailLoginPanel.classList.remove("hidden");

    if (exists(signupPanel))
        signupPanel.classList.add("hidden");

    setAuthStatus("");
}


function showSignupPanel() {

    if (exists(loginPanel))
        loginPanel.classList.add("hidden");

    if (exists(emailLoginPanel))
        emailLoginPanel.classList.add("hidden");

    if (exists(signupPanel))
        signupPanel.classList.remove("hidden");

    setAuthStatus("");
}


// ============================================================
// GOOGLE LOGIN
// ============================================================

if (exists(googleLoginButton)) {

    googleLoginButton.addEventListener("click", async () => {

        try {

            setAuthStatus("CONNECTING TO GOOGLE...");

            googleLoginButton.disabled = true;

            await signInWithPopup(
                auth,
                googleProvider
            );

        } catch (error) {

            console.error("GOOGLE LOGIN ERROR:", error);

            setAuthStatus(
                getFirebaseError(error),
                "error"
            );

        } finally {

            googleLoginButton.disabled = false;
        }
    });
}


// ============================================================
// GUEST LOGIN
// ============================================================

if (exists(guestLoginButton)) {

    guestLoginButton.addEventListener("click", async () => {

        try {

            setAuthStatus("STARTING GUEST SESSION...");

            guestLoginButton.disabled = true;

            await signInAnonymously(auth);

        } catch (error) {

            console.error("GUEST LOGIN ERROR:", error);

            setAuthStatus(
                getFirebaseError(error),
                "error"
            );

        } finally {

            guestLoginButton.disabled = false;
        }
    });
}


// ============================================================
// SHOW EMAIL LOGIN
// ============================================================

if (exists(showEmailLoginButton)) {

    showEmailLoginButton.addEventListener(
        "click",
        showEmailPanel
    );
}


// ============================================================
// SHOW SIGNUP
// ============================================================

if (exists(showSignupButton)) {

    showSignupButton.addEventListener(
        "click",
        showSignupPanel
    );
}


// ============================================================
// BACK BUTTONS
// ============================================================

if (exists(backToLoginButton)) {

    backToLoginButton.addEventListener(
        "click",
        showLoginPanel
    );
}


if (exists(backToLoginFromSignupButton)) {

    backToLoginFromSignupButton.addEventListener(
        "click",
        showLoginPanel
    );
}


// ============================================================
// EMAIL LOGIN
// ============================================================

if (exists(emailLoginButton)) {

    emailLoginButton.addEventListener(
        "click",
        async () => {

            const email =
                loginEmail?.value.trim();

            const password =
                loginPassword?.value;

            if (!email || !password) {

                setAuthStatus(
                    "ENTER YOUR EMAIL AND PASSWORD.",
                    "error"
                );

                return;
            }

            try {

                setAuthStatus("AUTHENTICATING...");

                emailLoginButton.disabled = true;

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            } catch (error) {

                console.error(
                    "EMAIL LOGIN ERROR:",
                    error
                );

                setAuthStatus(
                    getFirebaseError(error),
                    "error"
                );

            } finally {

                emailLoginButton.disabled = false;
            }
        }
    );
}


// ============================================================
// EMAIL SIGNUP
// ============================================================

if (exists(emailSignupButton)) {

    emailSignupButton.addEventListener(
        "click",
        async () => {

            const name =
                signupName?.value.trim();

            const email =
                signupEmail?.value.trim();

            const password =
                signupPassword?.value;

            if (!name || !email || !password) {

                setAuthStatus(
                    "PLEASE COMPLETE ALL FIELDS.",
                    "error"
                );

                return;
            }

            if (password.length < 6) {

                setAuthStatus(
                    "PASSWORD MUST BE AT LEAST 6 CHARACTERS.",
                    "error"
                );

                return;
            }

            try {

                setAuthStatus(
                    "CREATING YOUR ZARYX ID..."
                );

                emailSignupButton.disabled = true;

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                await updateProfile(
                    credential.user,
                    {
                        displayName: name
                    }
                );

            } catch (error) {

                console.error(
                    "SIGNUP ERROR:",
                    error
                );

                setAuthStatus(
                    getFirebaseError(error),
                    "error"
                );

            } finally {

                emailSignupButton.disabled = false;
            }
        }
    );
}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(auth, user => {

    currentUser = user;

    const isAuthPage =
        document.body.classList.contains("auth-page");

    const isZaryxPage =
        document.body.classList.contains("zaryx-page");


    // --------------------------------------------------------
    // AUTH PAGE
    // --------------------------------------------------------

    if (isAuthPage) {

        if (user) {

            console.log(
                "ZARYX AUTHENTICATED:",
                user.uid
            );

            window.location.href = "ZARYX.html";

        } else {

            console.log(
                "ZARYX WAITING FOR LOGIN"
            );
        }

        return;
    }


    // --------------------------------------------------------
    // ZARYX PAGE
    // --------------------------------------------------------

    if (isZaryxPage) {

        if (!user) {

            console.log(
                "NO USER — RETURNING TO LOGIN"
            );

            window.location.href = "index.html";

            return;
        }

        console.log(
            "ZARYX SESSION ACTIVE:",
            user.uid
        );

        loadConversation();
    }
});


// ============================================================
// LOGOUT
// ============================================================

if (exists(logoutButton)) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                sessionStorage.removeItem(
                    "zaryxConversation"
                );

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );
            }
        }
    );
}


// ============================================================
// CONVERSATION MEMORY
// ============================================================

function loadConversation() {

    try {

        const saved =
            sessionStorage.getItem(
                "zaryxConversation"
            );

        if (!saved) return;

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) return;

        conversationHistory = parsed;

        if (!exists(chatMessages)) return;

        const existingMessages =
            chatMessages.querySelectorAll(
                ".message"
            );

        existingMessages.forEach(
            message => message.remove()
        );

        conversationHistory.forEach(
            message => {

                if (
                    message.role !== "user" &&
                    message.role !== "assistant"
                ) {
                    return;
                }

                addMessageToUI(
                    message.role,
                    message.text
                );
            }
        );

        scrollChatToBottom();

    } catch (error) {

        console.error(
            "MEMORY LOAD ERROR:",
            error
        );
    }
}


function saveConversation() {

    try {

        sessionStorage.setItem(
            "zaryxConversation",
            JSON.stringify(
                conversationHistory.slice(-50)
            )
        );

    } catch (error) {

        console.error(
            "MEMORY SAVE ERROR:",
            error
        );
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


// ============================================================
// SIMPLE MARKDOWN
// ============================================================

function formatAIText(text) {

    let safe =
        escapeHTML(text);

    safe = safe.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    safe = safe.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    safe = safe.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    safe = safe.replace(
        /\n/g,
        "<br>"
    );

    return safe;
}


// ============================================================
// ADD MESSAGE TO UI
// ============================================================

function addMessageToUI(role, text) {

    if (!exists(chatMessages)) return;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message " +
        (role === "user"
            ? "user-message"
            : "assistant-message");


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        role === "user"
            ? "U"
            : "Z";


    const body =
        document.createElement("div");

    body.className =
        "message-body";


    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        role === "user"
            ? (
                currentUser?.displayName ||
                "YOU"
            )
            : "ZARYX";


    const messageText =
        document.createElement("div");

    messageText.className =
        "message-text";

    messageText.innerHTML =
        formatAIText(text);


    body.appendChild(name);
    body.appendChild(messageText);

    wrapper.appendChild(avatar);
    wrapper.appendChild(body);

    chatMessages.appendChild(wrapper);
}


// ============================================================
// SCROLL CHAT
// ============================================================

function scrollChatToBottom() {

    if (!exists(chatMessages)) return;

    requestAnimationFrame(() => {

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    });
}


// ============================================================
// TYPING INDICATOR
// ============================================================

function setTyping(show) {

    if (!exists(typingIndicator)) return;

    if (show) {

        typingIndicator.classList.remove(
            "hidden"
        );

    } else {

        typingIndicator.classList.add(
            "hidden"
        );
    }

    scrollChatToBottom();
}


// ============================================================
// SEND CHAT MESSAGE
// ============================================================

async function sendMessage() {

    if (!exists(chatInput)) return;

    const message =
        chatInput.value.trim();

    if (!message) return;


    // Prevent double sending
    if (sendButton?.disabled) return;


    // Add user message
    addMessageToUI(
        "user",
        message
    );


    // Save previous history BEFORE adding
    // current message to backend payload
    const previousHistory =
        conversationHistory.slice(-20);


    conversationHistory.push({
        role: "user",
        text: message
    });

    saveConversation();


    chatInput.value = "";

    chatInput.style.height = "auto";


    setTyping(true);

    if (exists(sendButton))
        sendButton.disabled = true;


    try {

        console.log(
            "ZARYX → BACKEND:",
            ZARYX_API_URL
        );


        const response =
            await fetch(
                ZARYX_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        history: previousHistory
                    })
                }
            );


        const rawText =
            await response.text();


        let data;

        try {

            data =
                JSON.parse(rawText);

        } catch (parseError) {

            console.error(
                "INVALID BACKEND RESPONSE:",
                rawText
            );

            throw new Error(
                "ZARYX received an invalid backend response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Backend error ${response.status}`
            );
        }


        if (data.error) {

            throw new Error(
                data.error
            );
        }


        const reply =
            data.reply ||
            "ZARYX received no response.";


        addMessageToUI(
            "assistant",
            reply
        );


        conversationHistory.push({
            role: "assistant",
            text: reply
        });


        saveConversation();

        scrollChatToBottom();


    } catch (error) {

        console.error(
            "ZARYX ERROR:",
            error
        );


        addMessageToUI(
            "assistant",
            "⚠️ ZARYX could not connect to the AI core.\n\n" +
            error.message
        );

    } finally {

        setTyping(false);

        if (exists(sendButton))
            sendButton.disabled = false;

        chatInput.focus();
    }
}


// ============================================================
// SEND BUTTON
// ============================================================

if (exists(sendButton)) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


// ============================================================
// ENTER TO SEND
// ============================================================

if (exists(chatInput)) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.isComposing
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    // Auto resize textarea
    chatInput.addEventListener(
        "input",
        () => {

            chatInput.style.height =
                "auto";

            chatInput.style.height =
                Math.min(
                    chatInput.scrollHeight,
                    180
                ) + "px";
        }
    );
}


// ============================================================
// MODE SWITCHING
// ============================================================

function switchToChat() {

    if (exists(chatModeButton))
        chatModeButton.classList.add("active");

    if (exists(imageModeButton))
        imageModeButton.classList.remove("active");

    if (exists(chatMode))
        chatMode.classList.add("active");

    if (exists(imageMode))
        imageMode.classList.remove("active");
}


function switchToImage() {

    if (exists(imageModeButton))
        imageModeButton.classList.add("active");

    if (exists(chatModeButton))
        chatModeButton.classList.remove("active");

    if (exists(imageMode))
        imageMode.classList.add("active");

    if (exists(chatMode))
        chatMode.classList.remove("active");
}


if (exists(chatModeButton)) {

    chatModeButton.addEventListener(
        "click",
        switchToChat
    );
}


if (exists(imageModeButton)) {

    imageModeButton.addEventListener(
        "click",
        switchToImage
    );
}


// ============================================================
// IMAGE GENERATION
// ============================================================

async function generateImage() {

    if (!exists(imagePrompt)) return;

    const prompt =
        imagePrompt.value.trim();

    if (!prompt) {

        if (exists(imageResult)) {

            imageResult.innerHTML =
                `<div class="image-error">
                    ⚠️ Describe the image you want first.
                </div>`;
        }

        return;
    }


    if (exists(generateImageButton))
        generateImageButton.disabled = true;

    if (exists(imageLoading))
        imageLoading.classList.remove("hidden");

    if (exists(imageResult))
        imageResult.innerHTML = "";


    try {

        console.log(
            "ZARYX → IMAGE BACKEND:",
            ZARYX_API_URL
        );


        const response =
            await fetch(
                ZARYX_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        action: "generateImage",
                        prompt: prompt
                    })
                }
            );


        const rawText =
            await response.text();


        let data;

        try {

            data =
                JSON.parse(rawText);

        } catch (parseError) {

            console.error(
                "INVALID IMAGE RESPONSE:",
                rawText
            );

            throw new Error(
                "Invalid image backend response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Backend error ${response.status}`
            );
        }


        if (data.error) {

            throw new Error(
                data.error
            );
        }


        if (
            !data.imageData ||
            !data.mimeType
        ) {

            throw new Error(
                "No image data was returned."
            );
        }


        const imageURL =
            `data:${data.mimeType};base64,${data.imageData}`;


        if (exists(imageResult)) {

            imageResult.innerHTML = `
                <div class="generated-image-wrapper">

                    <img
                        src="${imageURL}"
                        class="generated-image"
                        alt="Generated by ZARYX"
                    >

                    <a
                        href="${imageURL}"
                        download="zaryx-generated-image.jpg"
                        class="image-download-button"
                    >
                        ⬇ DOWNLOAD IMAGE
                    </a>

                </div>
            `;
        }


    } catch (error) {

        console.error(
            "ZARYX IMAGE ERROR:",
            error
        );


        if (exists(imageResult)) {

            imageResult.innerHTML = `
                <div class="image-error">
                    ⚠️ ZARYX IMAGE ERROR<br><br>
                    ${escapeHTML(error.message)}
                </div>
            `;
        }

    } finally {

        if (exists(imageLoading))
            imageLoading.classList.add("hidden");

        if (exists(generateImageButton))
            generateImageButton.disabled = false;
    }
}


// ============================================================
// IMAGE BUTTON
// ============================================================

if (exists(generateImageButton)) {

    generateImageButton.addEventListener(
        "click",
        generateImage
    );
}


// ============================================================
// IMAGE ENTER KEY
// ============================================================

if (exists(imagePrompt)) {

    imagePrompt.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.ctrlKey
            ) {

                event.preventDefault();

                generateImage();
            }
        }
    );
}


// ============================================================
// CUSTOM CURSOR
// ============================================================

const cursor =
    document.querySelector(".cursor");

const cursorRing =
    document.querySelector(".cursor-ring");


if (
    exists(cursor) &&
    exists(cursorRing) &&
    window.matchMedia("(pointer:fine)").matches
) {

    let mouseX = 0;
    let mouseY = 0;

    let ringX = 0;
    let ringY = 0;


    document.addEventListener(
        "mousemove",
        event => {

            mouseX = event.clientX;
            mouseY = event.clientY;


            cursor.style.left =
                mouseX + "px";

            cursor.style.top =
                mouseY + "px";
        }
    );


    function animateCursor() {

        ringX +=
            (mouseX - ringX) * 0.16;

        ringY +=
            (mouseY - ringY) * 0.16;


        cursorRing.style.left =
            ringX + "px";

        cursorRing.style.top =
            ringY + "px";


        requestAnimationFrame(
            animateCursor
        );
    }


    animateCursor();
}


// ============================================================
// BUTTON MICRO INTERACTION
// ============================================================

document
    .querySelectorAll(
        "button"
    )
    .forEach(button => {

        button.addEventListener(
            "mouseenter",
            () => {

                button.style.setProperty(
                    "--mouse-active",
                    "1"
                );
            }
        );


        button.addEventListener(
            "mouseleave",
            () => {

                button.style.setProperty(
                    "--mouse-active",
                    "0"
                );
            }
        );
    });


// ============================================================
// INITIAL LOG
// ============================================================

console.log(
    "%c ZARYX AI ONLINE ",
    "color:#00f6ff;font-weight:bold;font-size:16px;"
);

console.log(
    "%c Netlify proxy connected ",
    "color:#00ff9d;font-weight:bold;"
);