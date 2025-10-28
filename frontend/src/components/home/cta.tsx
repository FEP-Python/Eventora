import React from 'react'
import { Button } from '@/components/ui/button'

const CTA = () => {
    return (
        <section className="py-20 bg-[#F0F9EF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#344E41] mb-6">Ready to Transform Your Event Management?</h2>
                <p className="text-lg text-[#A3B18A] mb-8 max-w-3xl mx-auto">
                    Join thousands of organizations already using Eventora to create amazing events. Start your free trial
                    today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        variant="green"
                        className='text-lg'
                        asChild
                    >
                        <a href="#contact">Contact Us</a>
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default CTA
