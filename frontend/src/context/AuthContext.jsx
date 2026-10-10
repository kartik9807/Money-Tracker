import { createContext } from "react";
export const AuthContext = createContext(null);

//? React Fast Refresh tracks files containing only React components. When you edit a component file, 
//? Fast Refresh replaces just that component's code on the fly without refreshing the page or erasing your local component state.
//? However, a React Context (created via createContext()) is a JavaScript object, not a component
//? If a single file exports both a component and a context object, Fast Refresh gets confused
//? • It sees a component, so it wants to hot-reload it.
//? • It sees a raw JavaScript object (the Context), which it cannot safely hot-reload without potentially breaking data bindings elsewhere.
//? • Because the file has mixed exports, Fast Refresh gives up on hot-reloading that file and throws the warning.
//* Fast Refresh warnings generally occur when a file exports both React components and non-component values. A file that exports only contexts is fine;
//* a file that exports only provider components is fine too. You don't need a special filename to fix the warning