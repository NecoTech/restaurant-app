'use client'

import { useParams } from 'next/navigation'
import MenuItemDetails from '../../components/MenuItemDetails'

export default function MenuItemPage() {
    const params = useParams()
    const { itemid } = params

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <MenuItemDetails itemid={itemid as string} />
        </div>
    )
}