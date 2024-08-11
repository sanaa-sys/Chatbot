'use client';
import { Box, Button, Stack, TextField, createTheme, ThemeProvider } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import GoogleSignIn from '../components/GoogleSignIn';
import { auth } from '../lib/firebase';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000',
        },
        secondary: {
            main: '#ffffff',
        },
        background: {
            default: '#000000',
            paper: '#000000',
        },
        text: {
            primary: '#ffffff',
        },
    },
});

const MessageBubble = ({ role, content }) => (
    <Box
        display="flex"
        justifyContent={role === 'assistant' ? 'flex-start' : 'flex-end'}
    >
        <Box
            bgcolor={role === 'assistant' ? 'primary.main' : 'secondary.main'}
            color={role === 'assistant' ? 'secondary.main' : 'primary.main'}
            borderRadius={16}
            p={3}
            pr={6}
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} // Ensures text wraps correctly
        >
            {content}
        </Box>
    </Box>
);

const formatMessageContent = (text) => {
    return text.replace(/([.!?])\s*(?=[A-Z])/g, "$1\n\n"); // Add line breaks after sentences
};

export default function Home() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm the Chatbot Champs assistant. How can I help you today?",
        },
    ]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = (user) => {
        setUser(user);
    };

    const handleSignOut = () => {
        setUser(null);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const formattedMessage = formatMessageContent(message);

        setMessage('');
        setIsLoading(true);
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: formattedMessage },
            { role: 'assistant', content: '' },
        ]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([...messages, { role: 'user', content: formattedMessage }]),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    return [
                        ...prevMessages.slice(0, -1),
                        { ...lastMessage, content: lastMessage.content + text },
                    ];
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                            direction="column"
                            width="800px"
                            height="700px"
                            border="1px solid white"
                            p={2}
                            spacing={3}
                            bgcolor="background.paper"
                        >
                            <Stack
                                direction="column"
                                spacing={2}
                                flexGrow={1}
                                overflow="auto"
                                maxHeight="100%"
                            >
                                {messages.map((msg, index) => (
                                    <MessageBubble key={index} role={msg.role} content={msg.content} />
                                ))}
                            </Stack>
                            <Stack direction="row" spacing={2}>
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
                                    autoFocus
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
    );
}
