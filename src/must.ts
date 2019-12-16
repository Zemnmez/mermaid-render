export const must = <T1,R1>(
    fn: (arg1: T1) => R1 | Error
): ((arg1: T1) => R1) => 
    (a1: T1) => {
        const resp = fn(a1);
        if (resp instanceof Error) throw resp;
        return resp;
    };

