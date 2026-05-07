$file = "src/pages/Chat.jsx"
$content = Get-Content $file
$startLine = 6743
$endLine = 6970

$newContent = "                                    <div className=`"relative group/msg-content`">
                                      <MessageMarkdown
                                        msg={msg}
                                        typingMessageId={typingMessageId}
                                        navigate={navigate}
                                        setCurrentMode={setCurrentMode}
                                        activateToolWithTypingEffect={activateToolWithTypingEffect}
                                        setViewingDoc={setViewingDoc}
                                        handleDownload={handleDownload}
                                        isDownloadingUrl={isDownloadingUrl}
                                      />
                                    </div>"

$before = $content[0..($startLine-2)]
$after = $content[$endLine..($content.Length-1)]

$finalContent = $before + $newContent + $after
$finalContent | Set-Content $file -Encoding UTF8
