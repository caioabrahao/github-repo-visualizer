import { useState, useRef, useEffect } from "react"
import { Motion, spring } from "react-motion"

interface RepoCardProps {
  repo: {
    id: number
    name: string
    description: string
    stargazers_count: number
    language: string
  }
  initialPosition: { x: number; y: number }
  scale: number
}

export default function RepoCard({ repo, initialPosition, scale }: RepoCardProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: (e.clientX - dragOffset.x) / scale,
          y: (e.clientY - dragOffset.y) / scale,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1 && cardRef.current) {
      // Ignore middle mouse button
      const rect = cardRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left * scale,
        y: e.clientY - rect.top * scale,
      })
      setIsDragging(true)
      e.stopPropagation() // Prevent canvas dragging when dragging a card
    }
  }

  return (
    <Motion style={{ x: spring(position.x), y: spring(position.y) }}>
      {(interpolatedStyle) => (
        <div
          ref={cardRef}
          style={{
            position: "absolute",
            left: interpolatedStyle.x,
            top: interpolatedStyle.y,
            touchAction: "none",
            transform: `scale(${1 / scale})`,
            transformOrigin: "top left",
          }}
          className={`w-64 p-4 bg-white rounded-md shadow-md cursor-move select-none ${
            isDragging ? "opacity-75 z-10" : "opacity-100"
          }`}
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap" title={repo.name}>
            {repo.name}
          </h3>
          <p
            className="text-sm text-gray-600 mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
            title={repo.description}
          >
            {repo.description}
          </p>
          <div className="flex justify-between text-sm">
            <span>⭐ {repo.stargazers_count}</span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap" title={repo.language}>
              {repo.language}
            </span>
          </div>
        </div>
      )}
    </Motion>
  )
}

