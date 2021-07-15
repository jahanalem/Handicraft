using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jahan.Handicraft.Model.UModel
{
    public interface ICacheSettings
    {
        bool? Activate { get; set; }
        int TimeValid { get; set; }  
    }
}
