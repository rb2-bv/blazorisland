window.addEventListener("load", function() {
    let byImport:  { [id: string] : { target: Element}[]; }  = {}
    for(let target of document.getElementsByTagName("helper")) {
        let cmp = target.getAttribute("component");
        if (!cmp) {
            continue;
        }
        if (!byImport[cmp]) {
            byImport[cmp] = [];
        }
        byImport[cmp].push({
            target,
        })
    }
    for (let importname of Object.keys(byImport)) {
        import(importname).then(c => {
            for (let y of byImport[importname]) {
                new c.default({
                    target: y.target,
                    hydrate: true,
                })
            }
        })
    }
});