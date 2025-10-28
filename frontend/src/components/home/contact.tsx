import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'

const Contact = () => {
    return (
        <section id="contact" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="bg-[#3A5A40] text-white mb-4">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Us
                    </Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#344E41] mb-6">Get in Touch</h2>
                    <p className="text-xl text-[#3A5A40] max-w-3xl mx-auto">
                        Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <Card className="bg-white border-[#A3B18A]/20 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-[#588157] rounded-lg flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#344E41] mb-2">Email Us</h3>
                                    <p className="text-[#3A5A40] mb-1">tellawarved@gmail.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-[#A3B18A]/20 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-[#A3B18A] rounded-lg flex items-center justify-center">
                                    <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#344E41] mb-2">Call Us</h3>
                                    <p className="text-[#3A5A40] mb-1">+91 70589 40073</p>
                                    <p className="text-sm text-[#588157]">Mon-Fri 9AM - 6PM IST</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-[#A3B18A]/20 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-[#3A5A40] rounded-lg flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#344E41] mb-2">Visit Us</h3>
                                    <p className="text-[#3A5A40] mb-1">D.Y Patil College of Engineering</p>
                                    <p className="text-[#3A5A40]">Akurdi, PCMC, Maharashtra</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-lg border border-[#A3B18A]/20 shadow-sm p-6">
                        <h3 className="font-semibold text-[#344E41] mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white bg-transparent"
                            >
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white bg-transparent"
                            >
                                <Twitter className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white bg-transparent"
                            >
                                <Instagram className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white bg-transparent"
                            >
                                <Linkedin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contact
