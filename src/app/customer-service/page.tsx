import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'

export default function CustomerServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-black mb-8">Customer Service</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium text-black mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-gray-600">support@spacereserve.com</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hours</h3>
                <p className="text-gray-600">24/7 Support</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium text-black mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">How do I cancel a reservation?</h3>
                <p className="text-gray-600 text-sm">
                  You can cancel your reservation up to 2 hours before your scheduled time through
                  your reservations page.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Can I change my reservation time?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can modify your reservation by canceling and creating a new one, subject
                  to availability.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">What if I&apos;m running late?</h3>
                <p className="text-gray-600 text-sm">
                  Please contact us immediately. We&apos;ll do our best to accommodate you, but
                  reservations may be released after 15 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-black text-white hover:bg-gray-800">Contact Support</Button>
        </div>
      </div>
    </div>
  )
}
