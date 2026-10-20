import type React from "react";
import { TodoApp } from "./features/todos";
import "./index.css";

export const App: React.FC = () => {
	return (
		<div className="app-container">
			<TodoApp />
		</div>
	);
};

export default App;
