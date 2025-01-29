"use client"

import { useState, useRef, useEffect } from "react"
import { fetchGitHubRepos } from "../utils/github"
import RepoCard from "./RepoCard"
import { Motion, spring } from "react-motion"
import { Plus, Minus } from "lucide-react"

export default function DragDropEnvironment() {
  const [username, setUsername] = useState("")
  const [repos, setRepos] = useState<Array<any>>([])
  const [error, setError] = useState("")
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const fetchedRepos = await fetchGitHubRepos(username)
      const reposWithPositions = fetchedRepos.map((repo: any, index: number) => ({
        ...repo,
        position: {
          x: 50 + (index % 5) * 300,
          y: 50 + Math.floor(index / 5) * 200,
        },
      }))
      setRepos(reposWithPositions)
    } catch (err) {
      setError("Failed to fetch repositories. Please check the username and try again.")
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCanvas) {
        setCanvasOffset({
          x: canvasOffset.x + (e.clientX - startDragPos.x) / scale,
          y: canvasOffset.y + (e.clientY - startDragPos.y) / scale,
        })
        setStartDragPos({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDraggingCanvas(false)
    }

    if (isDraggingCanvas) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingCanvas, startDragPos, canvasOffset, scale])

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      // Middle mouse button
      e.preventDefault()
      setIsDraggingCanvas(true)
      setStartDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleZoom = (zoomIn: boolean) => {
    setScale((prevScale) => {
      const newScale = zoomIn ? prevScale * 1.1 : prevScale / 1.1
      return Math.max(0.1, Math.min(newScale, 5)) // Limit scale between 0.1 and 5
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-hidden">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <form onSubmit={handleSubmit} className="flex shadow-md">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Fetch Repos
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      <div className="fixed bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(true)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={24} />
        </button>
        <button
          onClick={() => handleZoom(false)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Minus size={24} />
        </button>
      </div>
      <Motion style={{ x: spring(canvasOffset.x), y: spring(canvasOffset.y), s: spring(scale) }}>
        {(interpolatedStyle) => (
          <div
            ref={canvasRef}
            className="absolute inset-0 cursor-move"
            style={{
              transform: `translate(${interpolatedStyle.x}px, ${interpolatedStyle.y}px) scale(${interpolatedStyle.s})`,
              transformOrigin: "0 0",
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} initialPosition={repo.position} scale={scale} />
            ))}
          </div>
        )}
      </Motion>
    </div>
  )
}

