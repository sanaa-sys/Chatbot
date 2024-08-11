'use client';
import { Box, Button, Stack, TextField, createTheme, ThemeProvider } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import GoogleSignIn from '../components/GoogleSignIn'; // Import the GoogleSignIn component
import { auth } from '../lib/firebase';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000', // Black
        },
        secondary: {
            main: '#ffffff', // White
        },
        background: {
            default: '#000000', // Black background
            paper: '#000000', // Black paper (Box)
        },
        text: {
            primary: '#ffffff', // White text
        },
    },
})

export default function Home() {
    const [user, setUser] = useState(null); // State to track the authenticated user
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm the Chatbot Champs assistant. How can I help you today?",
        },
    ])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Handle sign-in
    const handleSignIn = (user) => {
        setUser(user);
    };

    // Handle sign-out
    const handleSignOut = () => {
        setUser(null);
    };

    // Optional: Handle authentication persistence across sessions
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            }
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!message.trim()) return;

        setMessage('')
        setMessages((messages) => [
            ...messages,
            { role: 'user', content: message },
            { role: 'assistant', content: '' },
        ])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([...messages, { role: 'user', content: message }]),
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = decoder.decode(value, { stream: true })
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1]
                    let otherMessages = messages.slice(0, messages.length - 1)
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ]
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setMessages((messages) => [
                ...messages,
                { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
            ])
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <ThemeProvider theme={theme}>
            <Box
                width="100vw"
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="background.default"
                color="text.primary"
            >
                {user ? (
                    <>
                        <Stack
                            direction={'column'}
                            width="800px"
                            height="700px"
                            border="1px solid white"
                            p={2}
                            spacing={3}
                            bgcolor="background.paper"
                        >
                            <Stack
                                direction={'column'}
                                spacing={2}
                                flexGrow={1}
                                overflow="auto"
                                maxHeight="100%"
                            >
                                {messages.map((message, index) => (
                                    <Box
                                        key={index}
                                        display="flex"
                                        justifyContent={
                                            message.role === 'assistant' ? 'flex-start' : 'flex-end'
                                        }
                                    >
                                        <Box
                                            bgcolor={
                                                message.role === 'assistant'
                                                    ? 'primary.main'
                                                    : 'secondary.main'
                                            }
                                            color={
                                                message.role === 'assistant'
                                                    ? 'secondary.main'
                                                    : 'primary.main'
                                            }
                                            borderRadius={16}
                                            p={3}
                                            pr={6}
                                        >
                                            {message.content}
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                            <Stack direction={'row'} spacing={2}>
                                <TextField
                                    label="Type Message Here"
                                    fullWidth
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    InputProps={{
                                        style: {
                                            color: 'white',
                                        },
                                    }}
                                    InputLabelProps={{
                                        style: {
                                            color: 'white',
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={sendMessage}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send'}
                                </Button>
                                <div ref={messagesEndRef} />
                            </Stack>
                        </Stack>
                        <Button
                            variant="contained"
                            onClick={handleSignOut}
                            sx={{ marginTop: 2 }}
                        >
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <GoogleSignIn onSignIn={handleSignIn} onSignOut={handleSignOut} />
                )}
            </Box>
        </ThemeProvider>
    )
}
