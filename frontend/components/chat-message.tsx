import { Card } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";

interface Reference {
  text: string;
  page: number;
  source: string;
}

interface Attachment {
  name: string;
  url: string;
}

interface MessageProps {
  message: {
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    isStreaming?: boolean;
    references?: Reference[];
    attachments?: Attachment[];
  };
}

export default function ChatMessage({ message }: MessageProps) {
  const isAI = message.sender === "ai";
  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex ${isAI ? "flex-row" : "flex-row-reverse"} max-w-[80%]`}>
        <div>
        <Card
  className={`p-4 rounded-2xl shadow-lg ${
    isAI ? "bg-white text-gray-800 border border-gray-200" 
         : "bg-gray-100 text-gray-800 border border-gray-300"
  }`}
>
            {hasAttachments && (
              <div className="mb-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center p-2 rounded ${
                      isAI 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
                        : 'bg-black-200 hover:bg-black-300 text-black-900'
                    } transition-colors`}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{attachment.name}</span>
                  </a>
                ))}
              </div>
            )}

            {hasContent && (
              <p className={`text-base whitespace-pre-line ${hasAttachments ? 'mt-2' : ''}`}>
                {message.content}
              </p>
            )}

            {message.isStreaming && (
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs">...</span>
              </div>
            )}

            {message.references?.length > 0 && !message.isStreaming && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold mb-2">
                  Document references:
                </p>
                <div className="flex flex-col gap-2">
                  {message.references.map((ref, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex justify-between mb-1 text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">
                          {ref.source}
                        </span>
                        <span className="italic">Página {ref.page}</span>
                      </div>
                      <p className="text-gray-700 text-sm italic">
                        "{ref.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isAI ? "text-left" : "text-right"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
