import React from 'react'
import { Button } from '../ui/button'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="col-span-1 md:col-span-2">
                        <p className='text-[#344E41] text-3xl font-bold mb-1'>
                            Eventora
                        </p>
                        <p className="text-[#3A5A40] mb-4 max-w-md">
                            The complete event management platform for college clubs and organizations. Streamline your events,
                            manage teams, and track budgets effortlessly.
                        </p>
                        <div className="flex space-x-4">
                            <Button size="sm" variant="ghost" className="text-[#A3B18A] hover:text-white hover:bg-[#3A5A40]">
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#A3B18A] hover:text-white hover:bg-[#3A5A40]">
                                <Twitter className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#A3B18A] hover:text-white hover:bg-[#3A5A40]">
                                <Instagram className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#A3B18A] hover:text-white hover:bg-[#3A5A40]">
                                <Linkedin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-[#344E41]">Product</h3>
                        <ul className="space-y-2 text-[#3A5A40]">
                            <li>
                                <a href="#features" className="transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="transition-colors">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors">
                                    Integrations
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors">
                                    API
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4 text-[#344E41]">Support</h3>
                        <ul className="space-y-2 text-[#3A5A40]">
                            <li>
                                <a href="#" className="transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors">
                                    Status
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
