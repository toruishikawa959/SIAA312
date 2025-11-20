import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * POST /api/newsletter/send
 * Send newsletter email to subscribers
 * 
 * Request body:
 * {
 *   subject: string,
 *   message: string,
 *   recipientType: "all" | "active" | "inactive"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const subscribersCollection = db.collection("newsletter_subscribers")

    const body = await request.json()
    const { subject, message, recipientType = "active" } = body

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      )
    }

    // Build query based on recipient type
    let query: any = {}
    if (recipientType === "active") {
      query.active = true
    } else if (recipientType === "inactive") {
      query.active = false
    }
    // "all" means no filter

    // Fetch subscribers
    const subscribers = await subscribersCollection
      .find(query)
      .project({ email: 1, _id: 0 })
      .toArray()

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found for the selected recipient type" },
        { status: 400 }
      )
    }

    const emails = subscribers.map((sub: any) => sub.email)

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Postmark
    // 
    // For now, we'll simulate the email sending and log the details
    console.log("=".repeat(80))
    console.log("📧 NEWSLETTER EMAIL SENT")
    console.log("=".repeat(80))
    console.log(`Subject: ${subject}`)
    console.log(`Recipients: ${recipientType} (${emails.length} subscribers)`)
    console.log(`Message:\n${message}`)
    console.log("=".repeat(80))
    console.log(`Recipient Emails:\n${emails.join("\n")}`)
    console.log("=".repeat(80))

    // Here's where you would actually send emails in production:
    /*
    Example with SendGrid:
    
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to: emails,
      from: 'your-verified-sender@example.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>'),
    }
    
    await sgMail.send(msg)
    */

    return NextResponse.json(
      {
        success: true,
        message: `Newsletter sent to ${emails.length} subscriber(s)`,
        recipientCount: emails.length,
        recipients: emails,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Newsletter Send] Error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    )
  }
}
