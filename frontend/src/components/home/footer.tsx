import React from 'react'
import { Button } from '../ui/button'
import { Building2, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[#344E41] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Logo and Description */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <Building2 className="h-8 w-8 text-[#A3B18A]" />
                                <span className="text-xl font-bold">Eventora</span>
                            </div>
                            <p className="text-[#A3B18A] mb-4 max-w-md">
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
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-[#A3B18A]">
                                <li>
                                    <a href="#features" className="hover:text-white transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#pricing" className="hover:text-white transition-colors">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Integrations
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-[#A3B18A]">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#contact" className="hover:text-white transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[#3A5A40] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-[#A3B18A] text-sm">© 2024 Eventora. All rights reserved.</p>
                        <div className="flex space-x-6 text-sm text-[#A3B18A] mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
  )
}

export default Footer
