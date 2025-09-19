'use client'

import React, { useState } from 'react'
import { QrCode, Camera, CheckCircle, AlertCircle } from 'lucide-react'

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)

  const handleScan = (result) => {
    if (result) {
      setScanResult(result)
      setIsScanning(false)
      setScanError(null)
    }
  }

  const handleError = (error) => {
    setScanError(error)
    setIsScanning(false)
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanResult(null)
    setScanError(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600 mt-2">Quick book checkout and return using QR codes</p>
      </div>

      {/* Scanner Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code Scanner</h2>
            <p className="text-gray-600">Scan QR codes on books or member cards for quick actions</p>
          </div>

          {/* Scanner Area */}
          <div className="relative">
            <div className="w-full max-w-md mx-auto bg-gray-100 rounded-lg aspect-square flex items-center justify-center border-2 border-dashed border-gray-300">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Scanning...</p>
                  <button
                    onClick={stopScanning}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Stop Scanning
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Click to start scanning</p>
                  <button
                    onClick={startScanning}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Start Scanner</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scan Results */}
          {scanResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Scan Successful!</span>
              </div>
              <p className="text-green-700 mt-2">Scanned: {scanResult}</p>
              <div className="mt-4 flex space-x-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Check Out Book
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Return Book
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>
          )}

          {scanError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Scan Error</span>
              </div>
              <p className="text-red-700 mt-2">{scanError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Out Book</p>
                  <p className="text-sm text-gray-600">Scan book QR to borrow</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Return Book</p>
                  <p className="text-sm text-gray-600">Scan book QR to return</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Member Check-in</p>
                  <p className="text-sm text-gray-600">Scan member card</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">The Great Gatsby</p>
                <p className="text-xs text-gray-500">Checked out by John Doe</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">1984</p>
                <p className="text-xs text-gray-500">Returned by Jane Smith</p>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Member Check-in</p>
                <p className="text-xs text-gray-500">Sarah Wilson</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
