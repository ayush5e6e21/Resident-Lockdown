import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", color: "red", background: "#050505", minHeight: "100vh", fontFamily: "monospace" }}>
                    <h2>CRITICAL SYSTEM FAILURE</h2>
                    <p>The application encountered a fatal JavaScript error</p>
                    <br />
                    <p><strong>Error Message:</strong></p>
                    <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: "10px", border: "1px solid red" }}>{this.state.error?.message}</pre>
                    <br />
                    <p><strong>Stack Trace:</strong></p>
                    <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: "10px", border: "1px border red", fontSize: "12px", overflowX: "auto" }}>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}
