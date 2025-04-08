import Draggable from "react-draggable";
import { useRef } from "react";

export default function DraggableExample() {
    const nodeRef = useRef(null);

    return (
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef} className="box">Drag Me!</div>
        </Draggable>
    );
}
