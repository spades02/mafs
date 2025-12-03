import { CreditCard } from 'lucide-react'
import React from 'react'

const PaymentCard = () => {
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 hover-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Payment Method (Stripe)</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6">Secure payment processing powered by Stripe</p>

          <div className="grid gap-4 max-w-2xl">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Country</label>
                <input
                  type="text"
                  placeholder="US"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
)
}

export default PaymentCard