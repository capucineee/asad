import Foundation
import PDFKit
import AppKit
let input = "/Users/c/asad/output/pdf/plaquette-presentation-asad-veyliria.pdf"
let output = "/Users/c/asad/tmp/pdfs"
guard let doc = PDFDocument(url: URL(fileURLWithPath: input)) else { fatalError("cannot open PDF") }
for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let box = page.bounds(for: .mediaBox)
  let scale: CGFloat = 1.4
  let image = NSImage(size: NSSize(width: box.width * scale, height: box.height * scale))
  image.lockFocus()
  NSGraphicsContext.current?.imageInterpolation = .high
  NSColor.white.setFill(); NSRect(origin: .zero, size: image.size).fill()
  let ctx = NSGraphicsContext.current!.cgContext
  ctx.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx)
  image.unlockFocus()
  let dest = URL(fileURLWithPath: "\(output)/qa-page-\(i+1).png")
  let rep = NSBitmapImageRep(data: image.tiffRepresentation!)!
  try! rep.representation(using: .png, properties: [:])!.write(to: dest)
  print(dest.path)
}
