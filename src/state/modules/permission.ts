import { defineStore } from 'pinia'
import { isCompanyEdit } from '@/api/enterprise'
export const usePermissStore = defineStore('permission', {
    state: () => ({
        releationIds: <string[]>[],
        Permissions: <{ [key: string]: boolean | { hasPermission: boolean; extraData: any } }>{}
    }),
    actions: {
        updateReleationIds(id: string) {
            this.releationIds = [...this.releationIds, id]
        },
        hasReleationId(id: string) {
            return this.releationIds.includes(id)
        },
        updatePermissions(permissions: { [key: string]: boolean | { hasPermission: boolean; extraData: any } }) {
            this.Permissions = { ...this.Permissions, ...permissions }
        },
        async hasPermission(permission: string) {
            return new Promise<boolean | { hasPermission: boolean; extraData: any }>((resolve, reject) => {
                if (this.Permissions[permission] === undefined) {
                    switch (permission) {
                        case 'enterpriseEdit':
                            isCompanyEdit().then(res => {
                                if (res.success) {
                                    this.updatePermissions({
                                        enterpriseEdit: {
                                            hasPermission: res.data.isEdit,
                                            extraData: res.data
                                        }
                                    })
                                    resolve({
                                        hasPermission: res.data.isEdit,
                                        extraData: res.data
                                    })
                                } else {
                                    this.updatePermissions({ enterpriseEdit: false })
                                    resolve(false)
                                }
                            })
                            break
                        default:
                            resolve(false)
                            break
                    }
                } else {
                    resolve(this.Permissions[permission] || false)
                }
            })
        }
    }
})
