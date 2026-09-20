import Foundation
import PDFKit
import AppKit
let input = "/Users/c/asad/output/pdf/facture-parodie-asad-veyliria.pdf"
let output = "/Users/c/asad/tmp/pdfs/qa-facture-parodie.png"
let doc = PDFDocument(url: URL(fileURLWithPath: input))!
let page = doc.page(at: 0)!
let box = page.bounds(for: .mediaBox); let scale: CGFloat = 1.4
let image = NSImage(size: NSSize(width: box.width * scale, height: box.height * scale))
image.lockFocus(); NSColor.white.setFill(); NSRect(origin: .zero, size: image.size).fill()
let ctx = NSGraphicsContext.current!.cgContext; ctx.scaleBy(x: scale, y: scale); page.draw(with: .mediaBox, to: ctx); image.unlockFocus()
let rep = NSBitmapImageRep(data: image.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: output))
print(output)
