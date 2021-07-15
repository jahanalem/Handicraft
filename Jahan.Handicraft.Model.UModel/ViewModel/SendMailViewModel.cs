using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jahan.Handicraft.Model.UModel.ViewModel
{
    public class SendMailViewModel
    {
        public string TextMessage { get; set; }
        public string ReplyText { get; set; }
        public string SendTo { get; set; }
        public int ContentId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
    }
}
