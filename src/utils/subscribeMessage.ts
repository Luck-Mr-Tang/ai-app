// 订阅消息通知授权
export const authrizePush = (completeCall: any) => {
    console.log(123)

    uni.requestSubscribeMessage({
        tmplIds: ['N3waC2JB_Iui35o1VQ7p2CaJDrkoy3K36WGmNbqm1jI'],
        fail: res => {
            console.log(res)
        },
        complete: completeCall
    })
}
