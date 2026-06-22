import type { CanvasObjectInspectorCommentThread } from './CanvasObjectInspectorCommentThread'

export const CANVAS_COMMENT_THREAD_MODEL = 'canvas-comment-thread'

export function CanvasObjectInspectorCommentThreadView({
  thread,
}: {
  thread: CanvasObjectInspectorCommentThread
}) {
  return (
    <section
      aria-label="Comment thread"
      className="inspector-comment-thread"
      data-canvas-comment-thread-model={CANVAS_COMMENT_THREAD_MODEL}
      data-resolved={thread.resolved ? 'true' : 'false'}
    >
      <div className="inspector-comment-thread-header">
        <span>{thread.resolved ? 'Resolved' : 'Open'}</span>
        <button
          disabled={thread.disabled}
          onClick={thread.onToggleResolved}
          type="button"
        >
          {thread.resolved ? 'Reopen' : 'Resolve'}
        </button>
      </div>
      <div className="inspector-comment-thread-messages">
        {thread.messages.map((message) => (
          <article
            className="inspector-comment-thread-message"
            key={message.id}
          >
            <div className="inspector-comment-thread-meta">
              <span>{message.authorName}</span>
              <span>{message.createdAt}</span>
            </div>
            <div className="inspector-comment-thread-body">{message.body}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
