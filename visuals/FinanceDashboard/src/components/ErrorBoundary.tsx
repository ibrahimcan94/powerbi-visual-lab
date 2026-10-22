import React from "react";
export class ErrorBoundary extends React.Component<{children?:React.ReactNode;onError?:(message:string)=>void},{error:string|null}> {
    state:{error:string|null}={error:null};
    static getDerivedStateFromError(error:unknown):{error:string}{return {error:error instanceof Error?error.message:"An unexpected rendering error occurred."};}
    componentDidCatch(error:Error):void{this.props.onError?.(error.message);}
    render():React.ReactNode{return this.state.error?<div className="fd-start-state" role="alert"><h2>Unable to render this finance view</h2><p>{this.state.error}</p><button onClick={()=>this.setState({error:null})}>Try again</button></div>:this.props.children;}
}
